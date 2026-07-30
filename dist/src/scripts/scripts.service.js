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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const openai_1 = require("openai");
let ScriptsService = class ScriptsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '',
        });
    }
    async generateScript(userId, projectId, params) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiEditing) {
            throw new Error('AI script generation not available on your plan');
        }
        if (project.aiScript) {
            await this.prisma.aIScript.delete({
                where: { id: project.aiScript.id },
            });
        }
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
        const estimatedDuration = Math.ceil(wordCount / 150 * 60);
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
    buildScriptPrompt(params) {
        const toneGuidelines = {
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
    async generateHooks(userId, projectId, params) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true },
        });
        if (!project || !project.aiScript) {
            throw new common_1.NotFoundException('Script not found. Generate a script first.');
        }
        const count = params.count || 5;
        const typeGuidelines = {
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
        await this.prisma.aIScript.update({
            where: { id: project.aiScript.id },
            data: { hookVariants },
        });
        return { hooks: hookVariants };
    }
    async applyHook(userId, projectId, hookIndex) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true },
        });
        if (!project || !project.aiScript) {
            throw new common_1.NotFoundException('Script not found');
        }
        const hooks = project.aiScript.hookVariants || [];
        if (hookIndex < 0 || hookIndex >= hooks.length) {
            throw new Error('Invalid hook index');
        }
        const selectedHook = hooks[hookIndex];
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
    async getScript(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.aiScript;
    }
};
exports.ScriptsService = ScriptsService;
exports.ScriptsService = ScriptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ScriptsService);
//# sourceMappingURL=scripts.service.js.map