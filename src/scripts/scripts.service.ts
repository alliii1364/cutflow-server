import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class ScriptsService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY') || '',
    });
  }

  async generateScript(
    userId: string,
    projectId: string,
    params: {
      sourceType: 'url' | 'text' | 'product_page';
      sourceContent: string;
      tone: 'sales' | 'educational' | 'emotional' | 'storytelling';
      targetDuration?: number;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check AI script permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiEditing) {
      throw new Error('AI script generation not available on your plan');
    }

    // Delete existing script if any
    if (project.aiScript) {
      await this.prisma.aIScript.delete({
        where: { id: project.aiScript.id },
      });
    }

    // Generate script using OpenAI
    const prompt = this.buildScriptPrompt(params);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert video script writer. Generate engaging, conversion-focused video scripts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const generatedScript = response.choices[0].message.content || '';
    const wordCount = generatedScript.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 150 * 60); // ~150 words per minute

    // Save to database
    const aiScript = await this.prisma.aIScript.create({
      data: {
        projectId,
        sourceType: params.sourceType,
        sourceContent: params.sourceContent,
        tone: params.tone,
        generatedScript,
        wordCount,
        estimatedDuration,
        hookVariants: [],
      },
    });

    return aiScript;
  }

  private buildScriptPrompt(params: {
    sourceType: string;
    sourceContent: string;
    tone: string;
    targetDuration?: number;
  }): string {
    const toneGuidelines: Record<string, string> = {
      sales: 'Focus on benefits, create urgency, include call-to-action. Use persuasive language.',
      educational: 'Explain clearly, use examples, be informative and helpful. Keep it structured.',
      emotional: 'Connect with feelings, tell relatable stories, inspire action through emotion.',
      storytelling: 'Create narrative arc, build tension, resolve with satisfying conclusion.',
    };

    return `Create a video script based on the following:

Source Type: ${params.sourceType}
Source Content: ${params.sourceContent}

Tone: ${params.tone}
Guidelines: ${toneGuidelines[params.tone] || ''}
${params.targetDuration ? `Target Duration: ${params.targetDuration} seconds` : ''}

Requirements:
- Start with a strong hook (attention-grabbing first 3 seconds)
- Keep sentences short and punchy for video
- Include visual cues in [brackets]
- End with clear call-to-action
- Total script should be ${params.targetDuration ? `optimized for ${params.targetDuration} seconds` : 'engaging and concise'}

Format: Just the script text, no additional explanation.`;
  }

  async generateHooks(
    userId: string,
    projectId: string,
    params: {
      count?: number;
      type?: 'ad' | 'reel' | 'short';
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true },
    });

    if (!project || !project.aiScript) {
      throw new NotFoundException('Script not found. Generate a script first.');
    }

    const count = params.count || 5;
    const typeGuidelines: Record<string, string> = {
      ad: 'Focus on problem/solution, curiosity gap, or shocking statement. Keep under 5 seconds when spoken.',
      reel: 'Trendy, relatable, start with relatable situation or bold claim. Instagram/TikTok style.',
      short: 'Immediate value proposition or pattern interrupt. YouTube Shorts optimized.',
    };

    const prompt = `Generate ${count} different hook variations for this video script:

Original Script:
${project.aiScript.generatedScript}

Type: ${params.type || 'general'}
${typeGuidelines[params.type || 'general'] || ''}

Return as a JSON array of objects with "text" and "duration" (estimated seconds) fields.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate engaging video hooks that stop the scroll. Return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const hookVariants = result.hooks || result.variants || [];

    // Update script with hook variants
    await this.prisma.aIScript.update({
      where: { id: project.aiScript.id },
      data: { hookVariants },
    });

    return { hooks: hookVariants };
  }

  async applyHook(userId: string, projectId: string, hookIndex: number) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true },
    });

    if (!project || !project.aiScript) {
      throw new NotFoundException('Script not found');
    }

    const hooks = (project.aiScript.hookVariants as any[]) || [];
    if (hookIndex < 0 || hookIndex >= hooks.length) {
      throw new Error('Invalid hook index');
    }

    const selectedHook = hooks[hookIndex];

    // Update script with selected hook
    const aiScript = await this.prisma.aIScript.update({
      where: { id: project.aiScript.id },
      data: { selectedHookIndex: hookIndex },
    });

    return {
      message: 'Hook applied successfully',
      selectedHook,
      aiScript,
    };
  }

  async getScript(userId: string, projectId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.aiScript;
  }
}
