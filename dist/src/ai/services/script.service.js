"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScriptService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../../queue/queue.service");
const openai_1 = require("openai");
let ScriptService = ScriptService_1 = class ScriptService {
    constructor(configService, prisma, queue) {
        this.configService = configService;
        this.prisma = prisma;
        this.queue = queue;
        this.logger = new common_1.Logger(ScriptService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey });
        }
    }
    async generateScript(projectId, request) {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }
        const project = await this.prisma.videoProject.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        const job = await this.queue.addJob('scripts', 'generate', {
            projectId,
            request,
        });
        return {
            jobId: job.id,
            status: 'PENDING',
        };
    }
    async processScriptGeneration(jobData) {
        const { projectId, request } = jobData;
        this.logger.log(`Generating script for project ${projectId}`);
        try {
            let sourceContent = request.sourceContent;
            if (request.sourceType === 'website') {
                sourceContent = await this.fetchWebsiteContent(sourceContent);
            }
            const prompt = this.buildScriptPrompt(sourceContent, request.tone, request.duration);
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
            let script;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    script = JSON.parse(jsonMatch[0]);
                }
                else {
                    throw new Error('Invalid JSON response');
                }
            }
            catch (e) {
                const lines = responseText.split('\n').filter((l) => l.trim());
                const title = lines[0]?.replace(/^#*\s*/, '') || 'Generated Script';
                const content = lines.slice(1).join('\n').trim();
                const wordCount = content.split(/\s+/).length;
                script = {
                    title,
                    content,
                    estimatedDuration: Math.ceil(wordCount / 150 * 60),
                    wordCount,
                    suggestedBrolls: this.extractBrollSuggestions(content),
                };
            }
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
        }
        catch (error) {
            this.logger.error(`Script generation failed for project ${projectId}:`, error);
            throw error;
        }
    }
    async generateHooks(projectId, sourceContent, count = 3) {
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
        }
        catch (e) {
        }
        const hooks = [
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
    async getScript(projectId) {
        const script = await this.prisma.aIScript.findUnique({
            where: { projectId },
        });
        if (!script) {
            throw new Error('No script found for this project');
        }
        return script;
    }
    async updateScript(projectId, updates) {
        const script = await this.prisma.aIScript.update({
            where: { projectId },
            data: {
                ...updates,
                updatedAt: new Date(),
            },
        });
        return script;
    }
    async deleteScript(projectId) {
        await this.prisma.aIScript.delete({
            where: { projectId },
        });
        return { success: true, message: 'Script deleted' };
    }
    async fetchWebsiteContent(url) {
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
            const text = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 5000);
            return text;
        }
        catch (error) {
            this.logger.error(`Failed to fetch website ${url}:`, error);
            return `Content from ${url}`;
        }
    }
    buildScriptPrompt(content, tone, duration) {
        const toneInstructions = {
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
    extractBrollSuggestions(content) {
        const matches = content.match(/\[([^\]]+)\]/g) || [];
        return matches
            .map((m) => m.replace(/[\[\]]/g, '').trim())
            .filter((m) => m.length > 0)
            .slice(0, 5);
    }
    extractTopic(content) {
        const firstSentence = content.split(/[.!?]/)[0] || content;
        return firstSentence.substring(0, 50).trim();
    }
};
exports.ScriptService = ScriptService;
exports.ScriptService = ScriptService = ScriptService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], ScriptService);
//# sourceMappingURL=script.service.js.map