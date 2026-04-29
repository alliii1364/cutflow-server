import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(filters: {
    category?: string;
    platform?: string;
    industry?: string;
    style?: string;
    tier?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: any = { isActive: true };
    if (filters.category) where.category = filters.category;
    if (filters.platform) where.aspectRatios = { has: filters.platform };
    if (filters.industry) where.industry = filters.industry;
    if (filters.style) where.style = filters.style;
    if (filters.tier) where.tier = filters.tier;

    const [templates, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.template.count({ where }),
    ]);

    return {
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTemplateById(templateId: string) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async applyTemplate(userId: string, projectId: string, templateId: string, customConfig?: any) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { templateApplication: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Remove existing template application
    if (project.templateApplication) {
      await this.prisma.templateApplication.delete({
        where: { id: project.templateApplication.id },
      });
    }

    // Apply new template
    const application = await this.prisma.templateApplication.create({
      data: {
        projectId,
        templateId,
        appliedConfig: customConfig || template.config,
      },
    });

    // Update project with template settings
    await this.prisma.videoProject.update({
      where: { id: projectId },
      data: {
        aspectRatio: template.aspectRatios[0] || '16:9',
      },
    });

    return application;
  }

  async getAssets(filters: {
    type?: string;
    category?: string;
    tags?: string[];
    tier?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const where: any = { isActive: true };
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.tier) where.tier = filters.tier;
    if (filters.tags) where.tags = { hasSome: filters.tags };

    const [assets, total] = await Promise.all([
      this.prisma.creativeAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.creativeAsset.count({ where }),
    ]);

    return {
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAssetById(assetId: string) {
    const asset = await this.prisma.creativeAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async saveUserTemplate(userId: string, templateId: string, customName?: string, customConfig?: any) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const userTemplate = await this.prisma.userTemplate.upsert({
      where: {
        userId_templateId: { userId, templateId },
      },
      create: {
        userId,
        templateId,
        customName,
        customConfig,
      },
      update: {
        customName,
        customConfig,
      },
    });

    return userTemplate;
  }

  async getUserTemplates(userId: string) {
    return this.prisma.userTemplate.findMany({
      where: { userId },
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUserTemplate(userId: string, templateId: string) {
    await this.prisma.userTemplate.deleteMany({
      where: { userId, templateId },
    });

    return { success: true };
  }
}
