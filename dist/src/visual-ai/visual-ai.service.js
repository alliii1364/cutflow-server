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
exports.VisualAiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let VisualAiService = class VisualAiService {
    constructor(prisma, queue, configService) {
        this.prisma = prisma;
        this.queue = queue;
        this.configService = configService;
    }
    async removeBackground(userId, projectId, options) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiEditing) {
            throw new Error('AI editing not available on your plan');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'bg_removal',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    backgroundType: options.backgroundType,
                    backgroundValue: options.backgroundValue,
                },
            },
        });
        await this.queue.addJob('visual-ai', 'bg_removal', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            backgroundType: options.backgroundType,
            backgroundValue: options.backgroundValue,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async replaceBackground(userId, projectId, options) {
        return this.removeBackground(userId, projectId, options);
    }
    async removeWatermark(userId, projectId, watermarkArea) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiEditing) {
            throw new Error('AI editing not available on your plan');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'watermark_removal',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    watermarkArea,
                },
            },
        });
        await this.queue.addJob('visual-ai', 'watermark_removal', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            watermarkArea,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async createSimilarStyle(userId, projectId, referenceVideoUrl) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiEditing) {
            throw new Error('AI editing not available on your plan');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'similarity_engine',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    referenceVideoUrl,
                },
            },
        });
        await this.queue.addJob('visual-ai', 'similarity', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            referenceVideoUrl,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
};
exports.VisualAiService = VisualAiService;
exports.VisualAiService = VisualAiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        config_1.ConfigService])
], VisualAiService);
//# sourceMappingURL=visual-ai.service.js.map