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
exports.CaptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const openai_1 = require("openai");
let CaptionsService = class CaptionsService {
    constructor(prisma, queue, configService) {
        this.prisma = prisma;
        this.queue = queue;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '',
        });
    }
    async generateCaptions(userId, projectId, language = 'en') {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: { where: { type: 'MAIN', isPrimary: true } },
                caption: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiCaptions) {
            throw new Error('AI captions not available on your plan');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        if (project.caption) {
            await this.prisma.caption.delete({
                where: { id: project.caption.id },
            });
        }
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
    async getCaptions(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { caption: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.caption;
    }
    async updateCaptions(userId, projectId, data) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { caption: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (!project.caption) {
            throw new common_1.NotFoundException('No captions found for this project');
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
    async extractKeywords(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { caption: true },
        });
        if (!project || !project.caption) {
            throw new common_1.NotFoundException('Captions not found');
        }
        const captionText = project.caption.segments
            .map((s) => s.text)
            .join(' ');
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
            await this.prisma.caption.update({
                where: { id: project.caption.id },
                data: { keywords },
            });
            return { keywords };
        }
        catch (error) {
            const words = captionText.toLowerCase().split(/\s+/);
            const wordFreq = {};
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
    async applyAnimatedStyle(userId, projectId, styleName) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { caption: true },
        });
        if (!project || !project.caption) {
            throw new common_1.NotFoundException('Captions not found');
        }
        const animatedStyles = {
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
                    ...project.caption.style,
                    animation: style,
                },
            },
        });
        return caption;
    }
};
exports.CaptionsService = CaptionsService;
exports.CaptionsService = CaptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        config_1.ConfigService])
], CaptionsService);
//# sourceMappingURL=captions.service.js.map