import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface ExportJobData {
  exportId: string;
  projectId: string;
  resolution: 'P720' | 'P1080' | 'P4K';
  platform?: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TWITTER';
  mediaFiles: any[];
  caption: any;
  musicTrack: any;
  voiceTrack: any;
}

@Injectable()
export class VideoProcessorWorker implements OnModuleInit {
  private readonly logger = new Logger(VideoProcessorWorker.name);

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private storage: StorageService,
  ) {}

  onModuleInit() {
    this.queue.createWorker<ExportJobData>('export', async (job) => {
      await this.processExport(job);
    });
    this.logger.log('Video export worker initialized');
  }

  private async processExport(job: Job<ExportJobData>): Promise<void> {
    const { exportId, projectId, resolution, platform, mediaFiles, caption, musicTrack, voiceTrack } = job.data;
    
    this.logger.log(`Starting export ${exportId} for project ${projectId}`);
    
    const workDir = path.join(os.tmpdir(), `export-${exportId}`);
    
    try {
      // Update status to PROCESSING
      await this.prisma.videoExport.update({
        where: { id: exportId },
        data: { 
          status: 'PROCESSING',
          renderStartedAt: new Date(),
        },
      });

      await job.updateProgress(10);

      // Create working directory
      await fs.mkdir(workDir, { recursive: true });

      // Get resolution settings
      const { width, height, videoBitrate } = this.getResolutionSettings(resolution);

      // Download primary video
      const mainVideo = mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
      if (!mainVideo) {
        throw new Error('No primary video found');
      }

      const inputPath = path.join(workDir, 'input.mp4');
      await this.storage.downloadFile(mainVideo.s3Key, inputPath);
      
      await job.updateProgress(20);

      // Prepare output path
      const outputPath = path.join(workDir, 'output.mp4');

      // Build FFmpeg command
      let command = ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .videoBitrate(videoBitrate)
        .audioBitrate('192k')
        .format('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-pix_fmt yuv420p', // For browser compatibility
          '-preset medium',    // Balance between speed and quality
          '-movflags +faststart', // Enable streaming
        ]);

      // Apply platform-specific optimizations
      if (platform) {
        const platformSettings = this.getPlatformSettings(platform, width, height);
        command = command.size(`${platformSettings.width}x${platformSettings.height}`);
        
        // Apply aspect ratio padding/cropping if needed
        if (platformSettings.pad) {
          command = command.outputOptions([
            `-vf "scale=${platformSettings.width}:${platformSettings.height}:force_original_aspect_ratio=decrease,pad=${platformSettings.width}:${platformSettings.height}:(ow-iw)/2:(oh-ih)/2:black"`,
          ]);
        }
      }

      // Add caption burn-in if captions exist
      if (caption && caption.segments) {
        const subtitlePath = await this.createSubtitleFile(workDir, caption);
        command = command.outputOptions([
          `-vf "subtitles=${subtitlePath}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'"`,
        ]);
      }

      // Add background music if provided
      if (musicTrack) {
        const musicPath = path.join(workDir, 'music.mp3');
        await this.storage.downloadFile(musicTrack.s3Key, musicPath);
        command = command.input(musicPath)
          .complexFilter([
            '[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=3[aout]',
          ])
          .outputOptions(['-map 0:v', '-map [aout]']);
      }

      // Add voice track if provided
      if (voiceTrack && !musicTrack) {
        const voicePath = path.join(workDir, 'voice.mp3');
        await this.storage.downloadFile(voiceTrack.s3Key, voicePath);
        command = command.input(voicePath)
          .complexFilter([
            '[0:a][1:a]amix=inputs=2:duration=first[aout]',
          ])
          .outputOptions(['-map 0:v', '-map [aout]']);
      }

      await job.updateProgress(40);

      // Execute FFmpeg
      await new Promise<void>((resolve, reject) => {
        command
          .on('progress', (progress) => {
            const percent = Math.round((progress.percent || 0) * 0.5) + 40; // Scale to 40-90%
            job.updateProgress(percent).catch(() => {});
          })
          .on('end', () => {
            this.logger.log(`FFmpeg processing completed for export ${exportId}`);
            resolve();
          })
          .on('error', (err) => {
            this.logger.error(`FFmpeg error for export ${exportId}:`, err);
            reject(err);
          })
          .save(outputPath);
      });

      await job.updateProgress(90);

      // Get output file stats
      const outputStats = await fs.stat(outputPath);

      // Upload to S3
      const outputKey = `exports/${projectId}/${exportId}.mp4`;
      await this.storage.uploadFile(outputPath, outputKey, 'video/mp4');

      // Get file duration
      const duration = await this.getVideoDuration(outputPath);

      await job.updateProgress(100);

      // Update database
      await this.prisma.videoExport.update({
        where: { id: exportId },
        data: {
          status: 'COMPLETED',
          s3Key: outputKey,
          s3Url: await this.storage.getFileUrl(outputKey),
          fileSize: outputStats.size,
          duration: Math.round(duration),
          renderCompletedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      this.logger.log(`Export ${exportId} completed successfully`);

    } catch (error) {
      this.logger.error(`Export ${exportId} failed:`, error);
      
      await this.prisma.videoExport.update({
        where: { id: exportId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          renderCompletedAt: new Date(),
        },
      });

      throw error;
    } finally {
      // Cleanup temp files
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (e) {
        this.logger.warn(`Failed to cleanup work directory ${workDir}:`, e);
      }
    }
  }

  private getResolutionSettings(resolution: 'P720' | 'P1080' | 'P4K') {
    const settings = {
      P720: { width: 1280, height: 720, videoBitrate: '2500k' },
      P1080: { width: 1920, height: 1080, videoBitrate: '5000k' },
      P4K: { width: 3840, height: 2160, videoBitrate: '20000k' },
    };
    return settings[resolution];
  }

  private getPlatformSettings(platform: string, originalWidth: number, originalHeight: number) {
    const platforms: Record<string, { width: number; height: number; pad: boolean }> = {
      YOUTUBE: { width: 1920, height: 1080, pad: false },
      TIKTOK: { width: 1080, height: 1920, pad: true },
      INSTAGRAM: { width: 1080, height: 1080, pad: true },
      FACEBOOK: { width: 1280, height: 720, pad: false },
      LINKEDIN: { width: 1920, height: 1080, pad: false },
      TWITTER: { width: 1280, height: 720, pad: false },
    };
    return platforms[platform] || { width: originalWidth, height: originalHeight, pad: false };
  }

  private async createSubtitleFile(workDir: string, caption: any): Promise<string> {
    const subtitlePath = path.join(workDir, 'subtitles.ass');
    
    // Build ASS format subtitles
    let assContent = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    if (caption.segments && Array.isArray(caption.segments)) {
      for (const segment of caption.segments) {
        const start = this.formatTime(segment.start);
        const end = this.formatTime(segment.end);
        const text = segment.text.replace(/\n/g, '\\N');
        assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
      }
    }

    await fs.writeFile(subtitlePath, assContent, 'utf-8');
    return subtitlePath;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration || 0);
        }
      });
    });
  }
}
