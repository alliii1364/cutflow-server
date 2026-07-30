import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { plan: true },
        },
        brandKit: true,
        _count: {
          select: {
            videoProjects: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...sanitized } = user as any;
    return {
      ...sanitized,
      videoCount: user._count.videoProjects,
    };
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; email?: string }) {
    if (data.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    const { passwordHash, ...sanitized } = user as any;
    return sanitized;
  }

  async uploadAvatar(userId: string, file: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload to S3
    const { key, publicUrl } = await this.storage.generatePresignedUploadUrl(
      'avatars',
      file.originalname,
      file.mimetype,
    );

    // In real implementation, you'd use the presigned URL to upload
    // For now, we'll just update the record

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: publicUrl },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    const { passwordHash, ...sanitized } = updated as any;
    return sanitized;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  async getUsageStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalVideos = await this.prisma.videoProject.count({
      where: { userId, isDeleted: false },
    });

    const exportedVideos = await this.prisma.videoExport.count({
      where: {
        project: { userId },
        status: 'COMPLETED',
      },
    });

    const recentExports = await this.prisma.videoExport.findMany({
      where: {
        project: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: {
          select: { title: true, thumbnailUrl: true },
        },
      },
    });

    // Storage usage — aggregate in DB instead of loading all rows into memory
    const storageAgg = await this.prisma.mediaFile.aggregate({
      where: { project: { userId } },
      _sum: { size: true },
    });
    const storageUsed = storageAgg._sum.size ?? 0;

    return {
      subscription: user.subscription,
      videoQuota: {
        used: totalVideos,
        limit: user.subscription?.plan?.videoLimit || 0,
      },
      storage: {
        used: storageUsed,
        limit: (user.subscription?.plan?.maxStorageGb || 1) * 1024 * 1024 * 1024,
      },
      totalVideos,
      exportedVideos,
      recentExports,
    };
  }
}
