import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
import OpenAI from 'openai';

@Injectable()
export class MusicService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private storage: StorageService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || '',
    });
  }

  async generateMusic(
    userId: string,
    projectId: string,
    params: {
      style: 'CALM' | 'ENERGETIC' | 'CORPORATE' | 'EMOTIONAL' | 'UPBEAT' | 'EPIC';
      duration: number;
      mood?: string;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { musicTrack: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check AI music permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiMusic) {
      throw new Error('AI music generation not available on your plan');
    }

    // Create processing job
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'music_generation',
        status: 'PENDING',
        inputData: {
          style: params.style,
          duration: params.duration,
          mood: params.mood,
        },
      },
    });

    await this.queue.addJob('music', 'generate', {
      jobId: job.id,
      projectId,
      style: params.style,
      duration: params.duration,
      mood: params.mood,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async detectMoodAndMatchMusic(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: { where: { type: 'MAIN', isPrimary: true } },
        caption: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Analyze content to detect mood
    let contentForAnalysis = '';
    if (project.caption) {
      contentForAnalysis = (project.caption.segments as any[])
        .map((s) => s.text)
        .join(' ');
    }

    // Use AI to detect mood
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the content and determine the dominant mood/tone. Return a single word: CALM, ENERGETIC, CORPORATE, EMOTIONAL, UPBEAT, or EPIC.',
        },
        { role: 'user', content: contentForAnalysis || 'Video with no captions' },
      ],
    });

    const detectedMood = response.choices[0].message.content?.trim() || 'UPBEAT';

    // Queue music generation with detected mood
    const duration = project.duration || 60;

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'music_generation',
        status: 'PENDING',
        inputData: {
          style: detectedMood,
          duration,
          mood: detectedMood,
          autoDetected: true,
        },
      },
    });

    await this.queue.addJob('music', 'generate', {
      jobId: job.id,
      projectId,
      style: detectedMood,
      duration,
      mood: detectedMood,
    });

    return {
      detectedMood,
      jobId: job.id,
      status: 'QUEUED',
    };
  }

  async getBeatSyncTimestamps(musicTrackId: string, userId: string) {
    const track = await this.prisma.musicTrack.findFirst({
      where: { id: musicTrackId },
      include: { videoProjects: { where: { userId } } },
    });

    if (!track || track.videoProjects.length === 0) {
      throw new NotFoundException('Music track not found');
    }

    if (!track.beatTimestamps) {
      // Queue beat detection job
      const job = await this.queue.addJob('music', 'beat_detection', {
        trackId: musicTrackId,
        s3Key: track.s3Key,
      });

      return {
        status: 'PROCESSING',
        jobId: job.id,
        message: 'Beat detection in progress',
      };
    }

    return {
      status: 'READY',
      beatTimestamps: track.beatTimestamps,
    };
  }

  async assignMusicToProject(userId: string, projectId: string, musicTrackId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const track = await this.prisma.musicTrack.findUnique({
      where: { id: musicTrackId },
    });

    if (!track) {
      throw new NotFoundException('Music track not found');
    }

    await this.prisma.videoProject.update({
      where: { id: projectId },
      data: { musicTrackId },
    });

    return {
      success: true,
      message: 'Music assigned to project',
    };
  }

  async getProjectMusic(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { musicTrack: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.musicTrack;
  }
}
