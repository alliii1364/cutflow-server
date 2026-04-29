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
exports.AiEditingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const videos_service_1 = require("../videos/videos.service");
let AiEditingService = class AiEditingService {
    constructor(prisma, queue, videosService) {
        this.prisma = prisma;
        this.queue = queue;
        this.videosService = videosService;
    }
    async removeSilence(userId, projectId, options) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiEditing) {
            throw new Error('AI editing not available on your plan');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'silence_removal',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    threshold: options?.threshold || -30,
                    minDuration: options?.minDuration || 0.5,
                },
            },
        });
        await this.queue.addJob('ai-editing', 'silence_removal', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            threshold: options?.threshold || -30,
            minDuration: options?.minDuration || 0.5,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async resizeVideo(userId, projectId, targetAspectRatio) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const validRatios = ['16:9', '9:16', '1:1', '4:3'];
        if (!validRatios.includes(targetAspectRatio)) {
            throw new Error(`Invalid aspect ratio. Must be one of: ${validRatios.join(', ')}`);
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'resize',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    targetAspectRatio,
                    autoReframe: true,
                },
            },
        });
        await this.queue.addJob('ai-editing', 'resize', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            targetAspectRatio,
            autoReframe: true,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async applyFilters(userId, projectId, filters) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'filters',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    filters,
                },
            },
        });
        await this.queue.addJob('ai-editing', 'filters', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            filters,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async addZoomEffects(userId, projectId, timestamps) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'zoom_effects',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    timestamps,
                    effectType: 'zoom_in_out',
                },
            },
        });
        await this.queue.addJob('ai-editing', 'zoom_effects', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            timestamps,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async getJobStatus(jobId, userId) {
        const job = await this.prisma.processingJob.findFirst({
            where: { id: jobId, project: { userId } },
        });
        if (!job) {
            throw new common_1.NotFoundException('Job not found');
        }
        return job;
    }
    async getProjectJobs(projectId, userId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                processingJobs: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.processingJobs;
    }
};
exports.AiEditingService = AiEditingService;
exports.AiEditingService = AiEditingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        videos_service_1.VideosService])
], AiEditingService);
//# sourceMappingURL=ai-editing.service.js.map