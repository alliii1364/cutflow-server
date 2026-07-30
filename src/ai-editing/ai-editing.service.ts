import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { VideosService } from '../videos/videos.service';

@Injectable()
export class AiEditingService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private videosService: VideosService,
  ) {}

  async removeSilence(userId: string, projectId: string, options?: { threshold?: number; minDuration?: number }) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    // Check AI editing permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiEditing) {
      throw new Error('AI editing not available on your plan');
    }

    // Create processing job
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'silence_removal',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          threshold: options?.threshold || -30, // dB
          minDuration: options?.minDuration || 0.5, // seconds
        },
      },
    });

    // Queue the job
    await this.queue.addJob('ai-editing', 'silence_removal', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      threshold: options?.threshold || -30,
      minDuration: options?.minDuration || 0.5,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async resizeVideo(userId: string, projectId: string, targetAspectRatio: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const validRatios = ['16:9', '9:16', '1:1', '4:3'];
    if (!validRatios.includes(targetAspectRatio)) {
      throw new Error(`Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}`);
    }

    // Create processing job
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'resize',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          targetAspectRatio,
          autoReframe: true,
        },
      },
    });

    await this.queue.addJob('ai-editing', 'resize', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      targetAspectRatio,
      autoReframe: true,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async applyFilters(userId: string, projectId: string, filters: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    preset?: string;
  }) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'filters',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          filters,
        },
      },
    });

    await this.queue.addJob('ai-editing', 'filters', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      filters,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async addZoomEffects(userId: string, projectId: string, timestamps: number[]) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'zoom_effects',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          timestamps,
          effectType: 'zoom_in_out',
        },
      },
    });

    await this.queue.addJob('ai-editing', 'zoom_effects', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      timestamps,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async getJobStatus(jobId: string, userId: string) {
    const job = await this.prisma.processingJob.findFirst({
      where: { id: jobId, project: { userId } },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async getProjectJobs(projectId: string, userId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        processingJobs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.processingJobs;
  }
}
