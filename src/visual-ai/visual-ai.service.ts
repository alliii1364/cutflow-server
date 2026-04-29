import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class VisualAiService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private configService: ConfigService,
  ) {}

  async removeBackground(
    userId: string,
    projectId: string,
    options: { mediaId?: string; backgroundType: 'color' | 'image' | 'video'; backgroundValue?: string },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiEditing) {
      throw new Error('AI editing not available on your plan');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'bg_removal',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          backgroundType: options.backgroundType,
          backgroundValue: options.backgroundValue,
        },
      },
    });

    await this.queue.addJob('visual-ai', 'bg_removal', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      backgroundType: options.backgroundType,
      backgroundValue: options.backgroundValue,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async replaceBackground(
    userId: string,
    projectId: string,
    options: { backgroundType: 'color' | 'image' | 'video'; backgroundValue: string },
  ) {
    return this.removeBackground(userId, projectId, options);
  }

  async removeWatermark(userId: string, projectId: string, watermarkArea?: { x: number; y: number; width: number; height: number }) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiEditing) {
      throw new Error('AI editing not available on your plan');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'watermark_removal',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          watermarkArea,
        },
      },
    });

    await this.queue.addJob('visual-ai', 'watermark_removal', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      watermarkArea,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async createSimilarStyle(userId: string, projectId: string, referenceVideoUrl: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiEditing) {
      throw new Error('AI editing not available on your plan');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'similarity_engine',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          referenceVideoUrl,
        },
      },
    });

    await this.queue.addJob('visual-ai', 'similarity', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      referenceVideoUrl,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }
}
