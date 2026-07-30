import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import { StorageService } from '../../storage/storage.service';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';
import * as os from 'os';

interface CaptionSegment {
  start: number;
  end: number;
  text: string;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

@Injectable()
export class CaptionService {
  private readonly logger = new Logger(CaptionService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private queue: QueueService,
    private storage: StorageService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateCaptions(
    projectId: string,
    language: string = 'en',
    style?: {
      font?: string;
      color?: string;
      size?: number;
      position?: 'top' | 'bottom' | 'middle';
      animated?: boolean;
    },
  ) {
    // Check if OpenAI is configured
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const project = await this.prisma.videoProject.findUnique({
      where: { id: projectId },
      include: { mediaFiles: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const mainVideo = project.mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
    if (!mainVideo) {
      throw new Error('No primary video found');
    }

    // Queue caption generation job
    const job = await this.queue.addJob('captions', 'generate', {
      projectId,
      videoKey: mainVideo.s3Key,
      language,
      style,
    });

    return {
      jobId: job.id,
      status: 'PENDING',
      message: 'Caption generation queued',
    };
  }

  async processCaptionGeneration(jobData: {
    projectId: string;
    videoKey: string;
    language: string;
    style?: any;
  }): Promise<void> {
    const { projectId, videoKey, language, style } = jobData;
    const workDir = path.join(os.tmpdir(), `captions-${projectId}`);

    try {
      this.logger.log(`Starting caption generation for project ${projectId}`);

      // Create working directory
      await fs.mkdir(workDir, { recursive: true });

      // Download video
      const videoPath = path.join(workDir, 'video.mp4');
      await this.storage.downloadFile(videoKey, videoPath);

      // Extract audio using FFmpeg (we'll use the video file directly with Whisper)
      // Whisper can handle video files, so no need to extract audio separately

      // Call OpenAI Whisper API for transcription with word-level timestamps
      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(videoPath),
        model: 'whisper-1',
        language: language === 'auto' ? undefined : language,
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment'],
      });

      // Process segments
      const segments: CaptionSegment[] = transcription.segments?.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
        words: seg.words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        })),
      })) || [];

      // Extract keywords (simple approach: words longer than 5 chars or capitalized)
      const allText = segments.map((s) => s.text).join(' ');
      const words = allText.split(/\s+/);
      const keywords = words
        .filter((w) => w.length > 5 || /^[A-Z]/.test(w))
        .filter((w) => !['this', 'that', 'with', 'from', 'they', 'have'].includes(w.toLowerCase()))
        .slice(0, 10); // Top 10 keywords

      // Save to database
      await this.prisma.caption.upsert({
        where: { projectId },
        create: {
          projectId,
          language,
          segments: segments as any,
          style: style || {},
          keywords,
          isAnimated: style?.animated || false,
        },
        update: {
          language,
          segments: segments as any,
          style: style || {},
          keywords,
          isAnimated: style?.animated || false,
          updatedAt: new Date(),
        },
      });

      // Update project status
      await this.prisma.videoProject.update({
        where: { id: projectId },
        data: { status: 'READY' },
      });

      this.logger.log(`Caption generation completed for project ${projectId}`);
    } catch (error) {
      this.logger.error(`Caption generation failed for project ${projectId}:`, error);
      throw error;
    } finally {
      // Cleanup
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (e) {
        this.logger.warn(`Failed to cleanup work directory:`, e);
      }
    }
  }

  async getCaptions(projectId: string) {
    const caption = await this.prisma.caption.findUnique({
      where: { projectId },
    });

    if (!caption) {
      throw new Error('No captions found for this project');
    }

    return caption;
  }

  async updateCaptions(
    projectId: string,
    updates: {
      segments?: CaptionSegment[];
      style?: any;
      isAnimated?: boolean;
    },
  ) {
    const caption = await this.prisma.caption.update({
      where: { projectId },
      data: {
        updatedAt: new Date(),
        ...(updates.segments !== undefined && { segments: updates.segments as any }),
        ...(updates.style !== undefined && { style: updates.style }),
        ...(updates.isAnimated !== undefined && { isAnimated: updates.isAnimated }),
      },
    });

    return caption;
  }

  async deleteCaptions(projectId: string) {
    await this.prisma.caption.delete({
      where: { projectId },
    });

    return { success: true, message: 'Captions deleted' };
  }

  async burnCaptionsIntoVideo(
    projectId: string,
    exportId: string,
    videoPath: string,
    outputPath: string,
  ): Promise<void> {
    const caption = await this.prisma.caption.findUnique({
      where: { projectId },
    });

    if (!caption) {
      this.logger.warn(`No captions found for project ${projectId}, skipping burn-in`);
      return;
    }

    // Generate ASS subtitle file
    const subtitlePath = path.join(path.dirname(videoPath), 'subtitles.ass');
    await this.generateASSFile(caption, subtitlePath);

    // FFmpeg will handle the subtitle burn-in in the video processor
    // This is a placeholder for the actual implementation
    this.logger.log(`Generated subtitle file for burn-in: ${subtitlePath}`);
  }

  private async generateASSFile(caption: any, outputPath: string): Promise<void> {
    const style = caption.style || {};
    const fontName = style.font || 'Arial';
    const fontSize = style.size || 24;
    const primaryColor = this.hexToASSColor(style.color || '#FFFFFF');
    const position = style.position || 'bottom';
    
    // Map position to ASS alignment (1-9)
    const alignment = position === 'top' ? 8 : position === 'middle' ? 5 : 2;

    let assContent = `[Script Info]
Title: Generated Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,${alignment},10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    if (caption.segments && Array.isArray(caption.segments)) {
      for (const segment of caption.segments) {
        const start = this.formatASSTime(segment.start);
        const end = this.formatASSTime(segment.end);
        // ASS uses \N for newlines and \h for hard space
        const text = segment.text.replace(/\n/g, '\\N');
        assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
      }
    }

    await fs.writeFile(outputPath, assContent, 'utf-8');
  }

  private hexToASSColor(hex: string): string {
    // Convert #RRGGBB to &HBBGGRR& format used by ASS
    const clean = hex.replace('#', '');
    const r = clean.substring(0, 2);
    const g = clean.substring(2, 4);
    const b = clean.substring(4, 6);
    return `&H00${b}${g}${r}`;
  }

  private formatASSTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centis = Math.floor((seconds % 1) * 100);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  }
}