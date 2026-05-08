import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CacheService } from '../cache/cache.service';

const BROLL_LIBRARY_CACHE_KEY = 'broll:library';
const BROLL_LIBRARY_TTL = 1800; // 30 minutes
const BROLL_SEARCH_TTL = 300;   // 5 minutes

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private subscriptionsService: SubscriptionsService,
    private cache: CacheService,
  ) {}

  async getPresignedUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
    fileSize: number,
    isBroll: boolean = false,
  ) {
    // Check subscription limits
    const check = await this.subscriptionsService.checkVideoCreationAllowed(userId);
    if (!check.allowed) {
      throw new Error(check.reason);
    }

    // Check max video duration limit
    const maxDuration = check.subscription?.plan?.maxVideoDuration || 60;

    const folder = isBroll ? 'broll' : 'videos';
    const { uploadUrl, key, publicUrl } = await this.storage.generatePresignedUploadUrl(
      `${folder}/${userId}`,
      fileName,
      contentType,
    );

    return {
      uploadUrl,
      key,
      publicUrl,
      maxDuration,
      expiresIn: 300,
    };
  }

  async confirmUpload(
    userId: string,
    projectId: string,
    key: string,
    publicUrl: string,
    fileData: {
      originalName: string;
      mimeType: string;
      size: number;
      duration?: number;
      width?: number;
      height?: number;
    },
    isBroll: boolean = false,
  ) {
    // Verify project belongs to user
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        projectId,
        type: isBroll ? 'BROLL' : 'MAIN',
        originalName: fileData.originalName,
        s3Key: key,
        s3Url: publicUrl,
        mimeType: fileData.mimeType,
        size: fileData.size,
        duration: fileData.duration,
        width: fileData.width,
        height: fileData.height,
        isPrimary: !isBroll,
      },
    });

    // If main video, update project with metadata
    if (!isBroll && fileData.duration) {
      await this.prisma.videoProject.update({
        where: { id: projectId },
        data: {
          duration: fileData.duration,
          metadata: {
            width: fileData.width,
            height: fileData.height,
          },
        },
      });
    }

    return mediaFile;
  }

  async getProjectMedia(projectId: string, userId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.mediaFiles;
  }

  async deleteMediaFile(mediaId: string, userId: string) {
    const mediaFile = await this.prisma.mediaFile.findFirst({
      where: { id: mediaId },
      include: { project: true },
    });

    if (!mediaFile || mediaFile.project.userId !== userId) {
      throw new NotFoundException('Media file not found');
    }

    // Delete from S3
    await this.storage.deleteFile(mediaFile.s3Key);

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id: mediaId },
    });

    return { success: true };
  }

  // Google Drive integration placeholder
  async initiateGoogleDriveAuth(userId: string) {
    // TODO: Implement Google OAuth flow for Drive access
    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.FRONTEND_URL}/drive/callback&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly`,
    };
  }

  async importFromGoogleDrive(userId: string, driveFileId: string, projectId: string) {
    // TODO: Implement Google Drive file download and upload to S3
    throw new Error('Google Drive import not yet implemented');
  }

  async searchStockFootage(query: string, page: number = 1, perPage: number = 20) {
    // TODO: Integrate with stock footage API (Pexels, Pixabay, etc.)
    return {
      results: [],
      page,
      perPage,
      total: 0,
    };
  }

  async generateAiBroll(userId: string, projectId: string, prompt: string) {
    // TODO: Queue AI B-roll generation job
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Create placeholder media file
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        projectId,
        type: 'AI_GENERATED',
        originalName: 'ai-broll.mp4',
        s3Key: `pending/${projectId}/ai-broll`,
        s3Url: '',
        mimeType: 'video/mp4',
        size: 0,
      },
    });

    return {
      mediaId: mediaFile.id,
      status: 'PENDING',
      message: 'AI B-roll generation queued',
    };
  }

  // B-roll Library Methods
  async getBrollLibrary(q?: string) {
    const term = q?.trim() ?? '';
    const cacheKey = term ? `broll:search:${term.toLowerCase()}` : BROLL_LIBRARY_CACHE_KEY;
    const ttl = term ? BROLL_SEARCH_TTL : BROLL_LIBRARY_TTL;

    const cached = await this.cache.get<{ success: boolean; data: unknown[] }>(cacheKey);
    if (cached) return cached;

    const itemSelect = {
      id: true,
      name: true,
      description: true,
      tags: true,
      s3Url: true,
      thumbnailUrl: true,
      type: true,
      isPremium: true,
    } as const;

    const itemWhere = term
      ? {
          isActive: true,
          OR: [
            { name: { contains: term, mode: 'insensitive' as const } },
            { tags: { has: term } },
          ],
        }
      : { isActive: true };

    const categories = await this.prisma.brollCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            items: {
              where: itemWhere,
              orderBy: { sortOrder: 'asc' },
              select: itemSelect,
            },
          },
        },
      },
    });

    const filtered = term
      ? categories
          .map((cat) => ({
            ...cat,
            subcategories: cat.subcategories.filter((sub) => sub.items.length > 0),
          }))
          .filter((cat) => cat.subcategories.length > 0)
      : categories;

    const result = {
      success: true,
      data: filtered.map((cat) => ({
        id: cat.id,
        name: cat.name,
        subcategories: cat.subcategories.map((sub) => ({
          id: sub.id,
          name: sub.name,
          items: sub.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            tags: item.tags,
            url: item.s3Url,
            thumbnail_url: item.thumbnailUrl,
            type: item.type as 'image' | 'video',
            is_premium: item.isPremium,
          })),
        })),
      })),
    };

    void this.cache.set(cacheKey, result, ttl);
    return result;
  }

  // Admin methods for managing B-roll library
  async createBrollCategory(name: string, sortOrder: number = 0) {
    return this.prisma.brollCategory.create({
      data: { name, sortOrder },
    });
  }

  async createBrollSubcategory(categoryId: string, name: string, sortOrder: number = 0) {
    return this.prisma.brollSubcategory.create({
      data: { categoryId, name, sortOrder },
    });
  }

  async createBrollItem(
    subcategoryId: string,
    data: {
      name: string;
      description?: string;
      s3Key: string;
      s3Url: string;
      thumbnailUrl?: string;
      type?: string;
      isPremium?: boolean;
      duration?: number;
      tags?: string[];
    },
    sortOrder: number = 0,
  ) {
    return this.prisma.brollItem.create({
      data: {
        subcategoryId,
        name: data.name,
        description: data.description,
        s3Key: data.s3Key,
        s3Url: data.s3Url,
        thumbnailUrl: data.thumbnailUrl,
        type: data.type || 'video',
        isPremium: data.isPremium || false,
        duration: data.duration,
        tags: data.tags || [],
        sortOrder,
      },
    });
  }
}
