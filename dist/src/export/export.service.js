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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const storage_service_1 = require("../storage/storage.service");
let ExportService = class ExportService {
    constructor(prisma, queue, storage) {
        this.prisma = prisma;
        this.queue = queue;
        this.storage = storage;
    }
    async queueExport(userId, projectId, options) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: true,
                caption: true,
                musicTrack: true,
                voiceTrack: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (options.resolution === 'P4K' && !metadata?.allowedFeatures?.includes4K) {
            throw new Error('4K export not available on your plan');
        }
        const mainVideo = project.mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
        if (!mainVideo) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const videoExport = await this.prisma.videoExport.create({
            data: {
                projectId,
                resolution: options.resolution,
                platform: options.platform,
                status: 'PENDING',
            },
        });
        await this.queue.addJob('export', 'render', {
            exportId: videoExport.id,
            projectId,
            resolution: options.resolution,
            platform: options.platform,
            mediaFiles: project.mediaFiles,
            caption: project.caption,
            musicTrack: project.musicTrack,
            voiceTrack: project.voiceTrack,
        });
        return {
            exportId: videoExport.id,
            status: 'PENDING',
            message: 'Export queued for processing',
        };
    }
    async getExportStatus(userId, exportId) {
        const videoExport = await this.prisma.videoExport.findFirst({
            where: { id: exportId, project: { userId } },
            include: { project: { select: { title: true } } },
        });
        if (!videoExport) {
            throw new common_1.NotFoundException('Export not found');
        }
        return videoExport;
    }
    async getExportDownloadUrl(userId, exportId) {
        const videoExport = await this.prisma.videoExport.findFirst({
            where: { id: exportId, project: { userId }, status: 'COMPLETED' },
        });
        if (!videoExport || !videoExport.s3Key) {
            throw new common_1.NotFoundException('Export not found or not completed');
        }
        await this.prisma.videoExport.update({
            where: { id: exportId },
            data: {
                downloadCount: { increment: 1 },
                lastDownloadedAt: new Date(),
            },
        });
        const downloadUrl = await this.storage.generatePresignedDownloadUrl(videoExport.s3Key, 3600);
        return { downloadUrl, expiresIn: 3600 };
    }
    async getProjectExports(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                exports: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.exports;
    }
    async pushToGoogleDrive(userId, exportId) {
        const videoExport = await this.prisma.videoExport.findFirst({
            where: { id: exportId, project: { userId }, status: 'COMPLETED' },
        });
        if (!videoExport || !videoExport.s3Key) {
            throw new common_1.NotFoundException('Export not found or not completed');
        }
        return {
            success: true,
            message: 'Video pushed to Google Drive',
        };
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        storage_service_1.StorageService])
], ExportService);
//# sourceMappingURL=export.service.js.map