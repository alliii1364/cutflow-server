import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          subscription: { include: { plan: true } },
          _count: {
            select: {
              videoProjects: { where: { isDeleted: false } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({
        ...u,
        videoCount: u._count.videoProjects,
        _count: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUser(userId: string, data: {
    role?: UserRole;
    isActive?: boolean;
    planId?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: Prisma.UserUpdateInput = {};
    if (data.role) updates.role = data.role;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
      include: { subscription: { include: { plan: true } } },
    });

    // Update subscription plan if provided
    if (data.planId) {
      await this.prisma.subscription.update({
        where: { userId },
        data: { planId: data.planId },
      });
    }

    return updated;
  }

  // Subscription Management
  async getAllSubscriptions(page: number = 1, limit: number = 50) {
    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, plan: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count(),
    ]);

    return {
      data: subscriptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Template Management
  async createTemplate(data: Prisma.TemplateCreateInput) {
    return this.prisma.template.create({
      data,
    });
  }

  async updateTemplate(templateId: string, data: Prisma.TemplateUpdateInput) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.template.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(templateId: string) {
    await this.prisma.template.delete({
      where: { id: templateId },
    });

    return { success: true };
  }

  // Asset Management
  async createAsset(data: Prisma.CreativeAssetCreateInput) {
    return this.prisma.creativeAsset.create({
      data,
    });
  }

  async updateAsset(assetId: string, data: Prisma.CreativeAssetUpdateInput) {
    const asset = await this.prisma.creativeAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return this.prisma.creativeAsset.update({
      where: { id: assetId },
      data,
    });
  }

  // Feature Flags
  async getFeatureFlags() {
    return this.prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFeatureFlag(data: Prisma.FeatureFlagCreateInput) {
    return this.prisma.featureFlag.create({
      data,
    });
  }

  async updateFeatureFlag(flagId: string, data: Prisma.FeatureFlagUpdateInput) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { id: flagId },
    });

    if (!flag) {
      throw new NotFoundException('Feature flag not found');
    }

    return this.prisma.featureFlag.update({
      where: { id: flagId },
      data,
    });
  }

  // Analytics
  async getPlatformOverview() {
    const [
      totalUsers,
      activeUsers24h,
      totalVideos,
      totalExports,
      revenueData,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.videoProject.count({ where: { isDeleted: false } }),
      this.prisma.videoExport.count({ where: { status: 'COMPLETED' } }),
      this.prisma.subscription.aggregate({
        _sum: { videoCount: true },
        where: { status: 'ACTIVE' },
      }),
    ]);

    return {
      users: { total: totalUsers, active24h: activeUsers24h },
      videos: { total: totalVideos },
      exports: { total: totalExports },
      subscriptions: { active: revenueData._sum.videoCount || 0 },
    };
  }
}
