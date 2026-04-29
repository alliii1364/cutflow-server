import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
import OpenAI from 'openai';

@Injectable()
export class ExtrasService {
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

  // Brand Kit
  async getBrandKit(userId: string) {
    const brandKit = await this.prisma.brandKit.findUnique({
      where: { userId },
    });

    return brandKit || null;
  }

  async updateBrandKit(
    userId: string,
    data: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
      fontFamilySecondary?: string;
      defaultCaptionStyle?: any;
      watermarkEnabled?: boolean;
      watermarkUrl?: string;
      watermarkPosition?: string;
    },
  ) {
    // Check plan includes brand kit
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    });

    if (!user?.subscription?.plan?.includesBrandKit) {
      throw new Error('Brand Kit feature not available on your plan');
    }

    return this.prisma.brandKit.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // Thumbnail Generator
  async generateThumbnail(
    userId: string,
    projectId: string,
    options: { text?: string; frameTime?: number; style?: string },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No video file found');
    }

    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'thumbnail_generation',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          frameTime: options.frameTime || 0,
          text: options.text,
          style: options.style,
        },
      },
    });

    await this.queue.addJob('extras', 'thumbnail', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      ...options,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  // Project Versioning
  async saveVersion(userId: string, projectId: string, description?: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: true,
        caption: true,
        aiScript: true,
        templateApplication: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get next version number
    const lastVersion = await this.prisma.projectVersion.findFirst({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });
    const nextVersion = (lastVersion?.versionNumber || 0) + 1;

    const version = await this.prisma.projectVersion.create({
      data: {
        projectId,
        versionNumber: nextVersion,
        snapshot: project as any,
        changeDescription: description,
      },
    });

    return version;
  }

  async getVersions(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async restoreVersion(userId: string, projectId: string, versionId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const version = await this.prisma.projectVersion.findFirst({
      where: { id: versionId, projectId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // Save current state as new version before restoring
    await this.saveVersion(userId, projectId, 'Auto-save before restore');

    // Restore from snapshot
    const snapshot = version.snapshot as any;

    // Update project with restored data (selective fields)
    await this.prisma.videoProject.update({
      where: { id: projectId },
      data: {
        title: snapshot.title,
        description: snapshot.description,
        metadata: snapshot.metadata,
        aiEditsApplied: snapshot.aiEditsApplied,
      },
    });

    return { success: true, message: `Restored to version ${version.versionNumber}` };
  }

  // Webhooks
  async createWebhook(userId: string, url: string, events: string[]) {
    return this.prisma.webhook.create({
      data: {
        userId,
        url,
        events,
        isActive: true,
      },
    });
  }

  async getWebhooks(userId: string) {
    return this.prisma.webhook.findMany({
      where: { userId },
      include: {
        _count: { select: { deliveries: true } },
      },
    });
  }

  async updateWebhook(userId: string, webhookId: string, data: { url?: string; events?: string[]; isActive?: boolean }) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    return this.prisma.webhook.update({
      where: { id: webhookId },
      data,
    });
  }

  async deleteWebhook(userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: { id: webhookId },
    });

    return { success: true };
  }

  // SEO Metadata Generator
  async generateSeoMetadata(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { caption: true, aiScript: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get content for analysis
    let content = '';
    if (project.aiScript) {
      content = project.aiScript.generatedScript;
    } else if (project.caption) {
      content = (project.caption.segments as any[]).map((s) => s.text).join(' ');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Generate SEO metadata for a video. Return JSON with title, description, and hashtags.',
        },
        { role: 'user', content: content.substring(0, 1000) },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: result.title || project.title,
      description: result.description || project.description,
      hashtags: result.hashtags || [],
    };
  }

  // Referral System
  async getReferralCode(userId: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { referrerId: userId },
    });

    if (referral) {
      return referral;
    }

    // Create new referral code
    const code = this.generateReferralCode();
    return this.prisma.referral.create({
      data: {
        referrerId: userId,
        referredId: '', // Will be set when someone uses the code
        referralCode: code,
      },
    });
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async applyReferralCode(userId: string, code: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { referralCode: code },
    });

    if (!referral) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referral.referredId) {
      throw new Error('This referral code has already been used');
    }

    if (referral.referrerId === userId) {
      throw new Error('Cannot use your own referral code');
    }

    // Update referral with referred user
    await this.prisma.referral.update({
      where: { id: referral.id },
      data: { referredId: userId },
    });

    // Grant bonus credits to referrer
    // TODO: Add bonus credits logic

    return { success: true, message: 'Referral code applied' };
  }
}
