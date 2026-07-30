import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { VideoStatus } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private queue: QueueService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async createProject(
    userId: string,
    data: { title: string; description?: string; aspectRatio?: string },
  ) {
    // Check if user can create more videos
    const check = await this.subscriptionsService.checkVideoCreationAllowed(userId);
    if (!check.allowed) {
      throw new ForbiddenException(check.reason);
    }

    const maxDuration = check.subscription?.plan?.maxVideoDuration || 60;

    const project = await this.prisma.videoProject.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        aspectRatio: data.aspectRatio || '16:9',
        status: 'DRAFT',
        metadata: {
          maxDuration,
          allowedFeatures: {
            aiEditing: check.subscription?.plan?.includesAiEditing || false,
            aiCaptions: check.subscription?.plan?.includesAiCaptions || false,
            aiVoice: check.subscription?.plan?.includesAiVoice || false,
            aiAvatar: check.subscription?.plan?.includesAiAvatar || false,
            aiMusic: check.subscription?.plan?.includesAiMusic || false,
            includes4K: check.subscription?.plan?.includes4K || false,
          },
        },
      },
      include: {
        mediaFiles: true,
      },
    });

    return project;
  }

  async getUserProjects(userId: string, page: number = 1, limit: number = 20) {
    const [projects, total] = await Promise.all([
      this.prisma.videoProject.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          mediaFiles: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { mediaFiles: true },
          },
        },
      }),
      this.prisma.videoProject.count({
        where: { userId, isDeleted: false },
      }),
    ]);

    return {
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProject(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        caption: true,
        aiScript: true,
        musicTrack: true,
        voiceTrack: true,
        templateApplication: {
          include: { template: true },
        },
        exports: {
          orderBy: { createdAt: 'desc' },
        },
        processingJobs: {
          where: { status: { in: ['PENDING', 'PROCESSING'] } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    userId: string,
    projectId: string,
    data: { title?: string; description?: string; aspectRatio?: string },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.videoProject.update({
      where: { id: projectId },
      data: {
        title: data.title,
        description: data.description,
        aspectRatio: data.aspectRatio,
      },
      include: {
        mediaFiles: true,
        caption: true,
        aiScript: true,
      },
    });

    return updated;
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Soft delete
    await this.prisma.videoProject.update({
      where: { id: projectId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { success: true, message: 'Project moved to trash' };
  }

  async updateProjectStatus(
    userId: string,
    projectId: string,
    status: VideoStatus,
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.videoProject.update({
      where: { id: projectId },
      data: { status },
    });
  }

  async updateAiEdits(userId: string, projectId: string, editData: any) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const currentEdits = (project.aiEditsApplied as any[]) || [];
    const updatedEdits = [...currentEdits, { ...editData, appliedAt: new Date() }];

    return this.prisma.videoProject.update({
      where: { id: projectId },
      data: {
        aiEditsApplied: updatedEdits,
        status: editData.status || project.status,
      },
    });
  }

  async getProjectStatus(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      select: {
        id: true,
        status: true,
        processingJobs: {
          where: { status: { in: ['PENDING', 'PROCESSING'] } },
          select: {
            id: true,
            jobType: true,
            status: true,
            progress: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  // Project State Management for Frontend Sync

  async saveProjectState(
    userId: string,
    projectId: string,
    data: { state: Record<string, any>; thumbnailUrl?: string },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Calculate duration from state if available
    let duration: number | undefined;
    if (data.state?.timeline?.duration !== undefined) {
      duration = Math.round(data.state.timeline.duration);
    } else if (data.state?.composition?.duration !== undefined) {
      duration = Math.round(data.state.composition.duration);
    }

    // Save as a new version
    const versionNumber = await this.prisma.projectVersion.count({
      where: { projectId },
    });

    await this.prisma.$transaction([
      // Create version snapshot
      this.prisma.projectVersion.create({
        data: {
          projectId,
          versionNumber: versionNumber + 1,
          snapshot: data.state,
          changeDescription: 'Manual save from editor',
        },
      }),
      // Update project metadata
      this.prisma.videoProject.update({
        where: { id: projectId },
        data: {
          duration,
          thumbnailUrl: data.thumbnailUrl,
          metadata: {
            ...project.metadata as object,
            lastStateSave: new Date().toISOString(),
            version: versionNumber + 1,
          },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Project state saved',
      version: versionNumber + 1,
      savedAt: new Date().toISOString(),
    };
  }

  async loadProjectState(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        caption: true,
        aiScript: true,
        musicTrack: true,
        voiceTrack: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get the latest version
    const latestVersion = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });

    // Construct the full state object
    const state = latestVersion?.snapshot as Record<string, any> || {
      // Default empty state structure
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        aspectRatio: project.aspectRatio,
        duration: project.duration,
      },
      timeline: {
        tracks: [],
        duration: 0,
      },
      composition: {
        elements: [],
      },
      settings: {
        exportSettings: {
          resolution: '1080p',
          format: 'mp4',
          quality: 'high',
        },
      },
    };

    return {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        aspectRatio: project.aspectRatio,
        duration: project.duration,
        thumbnailUrl: project.thumbnailUrl,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        mediaFiles: project.mediaFiles,
        caption: project.caption,
        aiScript: project.aiScript,
        musicTrack: project.musicTrack,
        voiceTrack: project.voiceTrack,
      },
      state,
      version: latestVersion?.versionNumber || 1,
      lastSaved: latestVersion?.createdAt || project.createdAt,
    };
  }

  async exportProjectState(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const stateData = await this.loadProjectState(userId, projectId);

    return {
      success: true,
      data: stateData,
      exportFormat: 'json',
      exportedAt: new Date().toISOString(),
    };
  }

  // Video Export Methods

  async startExport(
    userId: string,
    projectId: string,
    data: { resolution: 'P720' | 'P1080' | 'P4K'; platform?: string },
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
    if (data.resolution === 'P4K' && !metadata?.allowedFeatures?.includes4K) {
      throw new ForbiddenException('4K export not available on your plan');
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
        resolution: data.resolution,
        platform: data.platform as any,
        status: 'PENDING',
      },
    });

    await this.queue.addJob('export', 'render', {
      exportId: videoExport.id,
      projectId,
      resolution: data.resolution,
      platform: data.platform,
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

    const downloadUrl = await this.storage.generatePresignedDownloadUrl(videoExport.s3Key, 3600);

    return { downloadUrl, expiresIn: 3600 };
  }
}
