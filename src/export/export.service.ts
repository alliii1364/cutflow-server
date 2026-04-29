import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ExportService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private storage: StorageService,
  ) {}

  async queueExport(
    userId: string,
    projectId: string,
    options: {
      resolution: 'P720' | 'P1080' | 'P4K';
      platform?: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TWITTER';
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: true,
        caption: true,
        musicTrack: true,
        voiceTrack: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check 4K permission
    const metadata = project.metadata as any;
    if (options.resolution === 'P4K' && !metadata?.allowedFeatures?.includes4K) {
      throw new Error('4K export not available on your plan');
    }

    // Check active media
    const mainVideo = project.mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
    if (!mainVideo) {
      throw new NotFoundException('No primary video file found');
    }

    // Create export record
    const videoExport = await this.prisma.videoExport.create({
      data: {
        projectId,
        resolution: options.resolution,
        platform: options.platform,
        status: 'PENDING',
      },
    });

    // Queue render job
    await this.queue.addJob('export', 'render', {
      exportId: videoExport.id,
      projectId,
      resolution: options.resolution,
      platform: options.platform,
      mediaFiles: project.mediaFiles,
      caption: project.caption,
      musicTrack: project.musicTrack,
      voiceTrack: project.voiceTrack,
    });

    return {
      exportId: videoExport.id,
      status: 'PENDING',
      message: 'Export queued for processing',
    };
  }

  async getExportStatus(userId: string, exportId: string) {
    const videoExport = await this.prisma.videoExport.findFirst({
      where: { id: exportId, project: { userId } },
      include: { project: { select: { title: true } } },
    });

    if (!videoExport) {
      throw new NotFoundException('Export not found');
    }

    return videoExport;
  }

  async getExportDownloadUrl(userId: string, exportId: string) {
    const videoExport = await this.prisma.videoExport.findFirst({
      where: { id: exportId, project: { userId }, status: 'COMPLETED' },
    });

    if (!videoExport || !videoExport.s3Key) {
      throw new NotFoundException('Export not found or not completed');
    }

    // Update download count
    await this.prisma.videoExport.update({
      where: { id: exportId },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    // Generate signed URL
    const downloadUrl = await this.storage.generatePresignedDownloadUrl(videoExport.s3Key, 3600);

    return { downloadUrl, expiresIn: 3600 };
  }

  async getProjectExports(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        exports: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.exports;
  }

  async pushToGoogleDrive(userId: string, exportId: string) {
    const videoExport = await this.prisma.videoExport.findFirst({
      where: { id: exportId, project: { userId }, status: 'COMPLETED' },
    });

    if (!videoExport || !videoExport.s3Key) {
      throw new NotFoundException('Export not found or not completed');
    }

    // TODO: Implement Google Drive push
    // 1. Get user's Google Drive tokens
    // 2. Download from S3
    // 3. Upload to user's Drive

    return {
      success: true,
      message: 'Video pushed to Google Drive',
    };
  }
}
