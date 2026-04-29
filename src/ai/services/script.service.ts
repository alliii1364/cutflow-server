import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import OpenAI from 'openai';

export type ScriptTone = 'sales' | 'educational' | 'emotional' | 'storytelling' | 'professional';

export interface ScriptGenerationRequest {
  sourceType: 'website' | 'text' | 'product';
  sourceContent: string;
  tone: ScriptTone;
  duration?: number; // Target duration in seconds
  language?: string;
}

export interface GeneratedScript {
  title: string;
  content: string;
  estimatedDuration: number;
  wordCount: number;
  suggestedBrolls: string[];
}

export interface GeneratedHook {
  text: string;
  type: 'question' | 'statistic' | 'story' | 'challenge' | 'benefit';
  estimatedDuration: number;
}

@Injectable()
export class ScriptService {
  private readonly logger = new Logger(ScriptService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private queue: QueueService,
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateScript(
    projectId: string,
    request: ScriptGenerationRequest,
  ): Promise<{ jobId: string; status: string }> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const project = await this.prisma.videoProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Queue script generation job
    const job = await this.queue.addJob('scripts', 'generate', {
      projectId,
      request,
    });

    return {
      jobId: job.id as string,
      status: 'PENDING',
    };
  }

  async processScriptGeneration(jobData: {
    projectId: string;
    request: ScriptGenerationRequest;
  }): Promise<GeneratedScript> {
    const { projectId, request } = jobData;

    this.logger.log(`Generating script for project ${projectId}`);

    try {
      // Extract content from source
      let sourceContent = request.sourceContent;
      
      if (request.sourceType === 'website') {
        sourceContent = await this.fetchWebsiteContent(sourceContent);
      }

      // Build prompt based on tone
      const prompt = this.buildScriptPrompt(sourceContent, request.tone, request.duration);

      // Call GPT-4
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert video scriptwriter specializing in ${request.tone} content. 
Create engaging, natural-sounding scripts optimized for video narration.
Provide output in JSON format with: title, content, estimatedDuration, wordCount, suggestedBrolls (array of B-roll descriptions).`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      
      // Parse JSON response
      let script: GeneratedScript;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          script = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response');
        }
      } catch (e) {
        // Fallback: create structured script from text
        const lines = responseText.split('\n').filter((l) => l.trim());
        const title = lines[0]?.replace(/^#*\s*/, '') || 'Generated Script';
        const content = lines.slice(1).join('\n').trim();
        const wordCount = content.split(/\s+/).length;
        
        script = {
          title,
          content,
          estimatedDuration: Math.ceil(wordCount / 150 * 60), // ~150 words per minute
          wordCount,
          suggestedBrolls: this.extractBrollSuggestions(content),
        };
      }

      // Save to database
      await this.prisma.aIScript.upsert({
        where: { projectId },
        create: {
          projectId,
          title: script.title,
          content: script.content,
          tone: request.tone,
          language: request.language || 'en',
          estimatedDuration: script.estimatedDuration,
          wordCount: script.wordCount,
          suggestedBrolls: script.suggestedBrolls,
          sourceType: request.sourceType,
          sourceUrl: request.sourceType === 'website' ? request.sourceContent : null,
        },
        update: {
          title: script.title,
          content: script.content,
          tone: request.tone,
          language: request.language || 'en',
          estimatedDuration: script.estimatedDuration,
          wordCount: script.wordCount,
          suggestedBrolls: script.suggestedBrolls,
          sourceType: request.sourceType,
          sourceUrl: request.sourceType === 'website' ? request.sourceContent : null,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Script generated for project ${projectId}: ${script.title}`);

      return script;
    } catch (error) {
      this.logger.error(`Script generation failed for project ${projectId}:`, error);
      throw error;
    }
  }

  async generateHooks(
    projectId: string,
    sourceContent: string,
    count: number = 3,
  ): Promise<GeneratedHook[]> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate ${count} attention-grabbing video hooks (opening lines) based on this content:

"""${sourceContent}"""

Each hook should:
- Be 5-15 seconds when spoken (~15-40 words)
- Grab attention immediately
- Create curiosity or emotional response
- Match the video's topic

Provide output as JSON array with format: [{ text, type (question|statistic|story|challenge|benefit), estimatedDuration }]`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing viral video hooks and openings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback parsing
    }

    // Fallback: generate simple hooks
    const hooks: GeneratedHook[] = [
      {
        text: `Want to know the secret to ${this.extractTopic(sourceContent)}?`,
        type: 'question',
        estimatedDuration: 5,
      },
      {
        text: `Stop! Before you scroll, hear this...`,
        type: 'challenge',
        estimatedDuration: 4,
      },
      {
        text: `Here's why ${this.extractTopic(sourceContent)} matters more than ever.`,
        type: 'benefit',
        estimatedDuration: 6,
      },
    ];

    return hooks.slice(0, count);
  }

  async getScript(projectId: string) {
    const script = await this.prisma.aIScript.findUnique({
      where: { projectId },
    });

    if (!script) {
      throw new Error('No script found for this project');
    }

    return script;
  }

  async updateScript(projectId: string, updates: {
    content?: string;
    title?: string;
  }) {
    const script = await this.prisma.aIScript.update({
      where: { projectId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return script;
  }

  async deleteScript(projectId: string) {
    await this.prisma.aIScript.delete({
      where: { projectId },
    });

    return { success: true, message: 'Script deleted' };
  }

  private async fetchWebsiteContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VideoScriptBot/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }

      const html = await response.text();
      
      // Simple HTML text extraction (in production, use a proper HTML parser)
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars

      return text;
    } catch (error) {
      this.logger.error(`Failed to fetch website ${url}:`, error);
      return `Content from ${url}`;
    }
  }

  private buildScriptPrompt(content: string, tone: ScriptTone, duration?: number): string {
    const toneInstructions: Record<ScriptTone, string> = {
      sales: 'Focus on benefits, use persuasive language, include call-to-action. Make it compelling and conversion-focused.',
      educational: 'Explain clearly, use examples, be informative and easy to understand. Structure logically.',
      emotional: 'Connect with feelings, use storytelling, evoke empathy or inspiration. Make it relatable.',
      storytelling: 'Use narrative structure, characters, conflict and resolution. Make it engaging and memorable.',
      professional: 'Be formal, authoritative, and credible. Use industry terminology appropriately.',
    };

    const durationInstruction = duration 
      ? `Target duration: ${duration} seconds. Adjust length accordingly.` 
      : 'Aim for 60-90 seconds (approximately 150-225 words).';

    return `Create a video script based on this content:

"""${content}"""

Requirements:
- Tone: ${tone}. ${toneInstructions[tone]}
- ${durationInstruction}
- Format: Title, followed by script content with natural pauses indicated by "..."
- Include suggestions for B-roll footage in [brackets]

Provide output as JSON with: title, content, estimatedDuration, wordCount, suggestedBrolls (array)`;
  }

  private extractBrollSuggestions(content: string): string[] {
    const matches = content.match(/\[([^\]]+)\]/g) || [];
    return matches
      .map((m) => m.replace(/[\[\]]/g, '').trim())
      .filter((m) => m.length > 0)
      .slice(0, 5);
  }

  private extractTopic(content: string): string {
    // Simple topic extraction (first 50 chars or first sentence)
    const firstSentence = content.split(/[.!?]/)[0] || content;
    return firstSentence.substring(0, 50).trim();
  }
}
