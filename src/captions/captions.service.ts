import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import OpenAI from 'openai';

@Injectable()
export class CaptionsService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || '',
    });
  }

  async generateCaptions(userId: string, projectId: string, language: string = 'en') {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: {
        mediaFiles: { where: { type: 'MAIN', isPrimary: true } },
        caption: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check AI captions permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiCaptions) {
      throw new Error('AI captions not available on your plan');
    }

    const mediaFile = project.mediaFiles[0];
    if (!mediaFile) {
      throw new NotFoundException('No primary video file found');
    }

    // Check if captions already exist
    if (project.caption) {
      await this.prisma.caption.delete({
        where: { id: project.caption.id },
      });
    }

    // Create processing job for Whisper transcription
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'caption_generation',
        status: 'PENDING',
        inputData: {
          mediaId: mediaFile.id,
          s3Key: mediaFile.s3Key,
          language,
        },
      },
    });

    await this.queue.addJob('captions', 'generate', {
      jobId: job.id,
      projectId,
      mediaId: mediaFile.id,
      s3Key: mediaFile.s3Key,
      language,
    });

    return { jobId: job.id, status: 'QUEUED', message: 'Caption generation started' };
  }

  async getCaptions(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { caption: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.caption;
  }

  async updateCaptions(
    userId: string,
    projectId: string,
    data: {
      segments?: any[];
      style?: any;
      keywords?: string[];
      isAnimated?: boolean;
      wordHighlighting?: boolean;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { caption: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.caption) {
      throw new NotFoundException('No captions found for this project');
    }

    const caption = await this.prisma.caption.update({
      where: { id: project.caption.id },
      data: {
        segments: data.segments,
        style: data.style,
        keywords: data.keywords,
        isAnimated: data.isAnimated,
        wordHighlighting: data.wordHighlighting,
      },
    });

    return caption;
  }

  async extractKeywords(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { caption: true },
    });

    if (!project || !project.caption) {
      throw new NotFoundException('Captions not found');
    }

    const captionText = (project.caption.segments as any[])
      .map((s) => s.text)
      .join(' ');

    // Use OpenAI to extract important keywords
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract 5-10 important keywords from the text. Return only a JSON array of strings.',
          },
          {
            role: 'user',
            content: captionText,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      const keywords = result.keywords || [];

      // Update caption with keywords
      await this.prisma.caption.update({
        where: { id: project.caption.id },
        data: { keywords },
      });

      return { keywords };
    } catch (error) {
      // Fallback: simple keyword extraction
      const words = captionText.toLowerCase().split(/\s+/);
      const wordFreq: Record<string, number> = {};
      words.forEach((w) => {
        if (w.length > 4) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
        }
      });
      const keywords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

      await this.prisma.caption.update({
        where: { id: project.caption.id },
        data: { keywords },
      });

      return { keywords };
    }
  }

  async applyAnimatedStyle(userId: string, projectId: string, styleName: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { caption: true },
    });

    if (!project || !project.caption) {
      throw new NotFoundException('Captions not found');
    }

    const animatedStyles: Record<string, any> = {
      bounce: {
        animation: 'bounce',
        duration: 0.3,
        stagger: 0.05,
      },
      pop: {
        animation: 'pop',
        duration: 0.2,
        stagger: 0.03,
      },
      slide: {
        animation: 'slide',
        duration: 0.4,
        stagger: 0.04,
      },
    };

    const style = animatedStyles[styleName] || animatedStyles.bounce;

    const caption = await this.prisma.caption.update({
      where: { id: project.caption.id },
      data: {
        isAnimated: true,
        style: {
          ...(project.caption.style as object),
          animation: style,
        },
      },
    });

    return caption;
  }
}
