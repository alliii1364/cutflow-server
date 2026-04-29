import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class SplitTestingService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}

  async createSplitTest(
    userId: string,
    projectId: string,
    options: {
      testHooks?: boolean;
      testCaptions?: boolean;
      testMusic?: boolean;
      testVoice?: boolean;
      variantCount?: number;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        aiScript: true,
        caption: true,
        musicTrack: true,
        voiceTrack: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Generate variant configurations
    const variants: any[] = [];
    const count = options.variantCount || 4;

    // Get available options for each test type
    const hooks = (project.aiScript?.hookVariants as any[]) || [];
    const captionStyles = [
      { name: 'Bold', font: 'Impact', color: '#FFFFFF' },
      { name: 'Modern', font: 'Inter', color: '#000000' },
      { name: 'Fun', font: 'Comic Sans', color: '#FF6B6B' },
    ];
    const musicStyles = ['UPBEAT', 'CALM', 'EPIC', 'CORPORATE'];

    for (let i = 0; i < count; i++) {
      const variant: any = {
        id: `variant-${i + 1}`,
        name: `Variant ${i + 1}`,
        changes: {},
      };

      if (options.testHooks && hooks.length > i) {
        variant.changes.hook = hooks[i];
      }

      if (options.testCaptions) {
        variant.changes.captionStyle = captionStyles[i % captionStyles.length];
      }

      if (options.testMusic) {
        variant.changes.musicStyle = musicStyles[i % musicStyles.length];
      }

      if (options.testVoice) {
        variant.changes.voice = { pitch: 1 + (i * 0.1) };
      }

      variants.push(variant);
    }

    const session = await this.prisma.splitTestSession.create({
      data: {
        projectId,
        name: `Split Test ${new Date().toLocaleDateString()}`,
        variants,
        totalVariants: variants.length,
        status: 'PENDING',
      },
    });

    return session;
  }

  async getVariants(userId: string, sessionId: string) {
    const session = await this.prisma.splitTestSession.findFirst({
      where: { id: sessionId, project: { userId } },
    });

    if (!session) {
      throw new NotFoundException('Split test session not found');
    }

    return {
      session,
      variants: session.variants,
    };
  }

  async exportAllVariants(userId: string, sessionId: string) {
    const session = await this.prisma.splitTestSession.findFirst({
      where: { id: sessionId, project: { userId } },
    });

    if (!session) {
      throw new NotFoundException('Split test session not found');
    }

    const variants = session.variants as any[];

    // Queue exports for all variants
    for (const variant of variants) {
      await this.queue.addJob('export', 'render-variant', {
        sessionId,
        variantId: variant.id,
        projectId: session.projectId,
        variantChanges: variant.changes,
      });
    }

    await this.prisma.splitTestSession.update({
      where: { id: sessionId },
      data: { status: 'PROCESSING' },
    });

    return {
      sessionId,
      status: 'PROCESSING',
      message: `Queued ${variants.length} variants for export`,
    };
  }

  async getExportStatus(userId: string, sessionId: string) {
    const session = await this.prisma.splitTestSession.findFirst({
      where: { id: sessionId, project: { userId } },
    });

    if (!session) {
      throw new NotFoundException('Split test session not found');
    }

    return session;
  }
}
