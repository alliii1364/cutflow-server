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
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let VideosService = class VideosService {
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
    }
    async createProject(userId, data) {
        const check = await this.subscriptionsService.checkVideoCreationAllowed(userId);
        if (!check.allowed) {
            throw new common_1.ForbiddenException(check.reason);
        }
        const maxDuration = check.subscription?.plan?.maxVideoDuration || 60;
        const project = await this.prisma.videoProject.create({
            data: {
                userId,
                title: data.title,
                description: data.description,
                aspectRatio: data.aspectRatio || '16:9',
                status: 'DRAFT',
                metadata: {
                    maxDuration,
                    allowedFeatures: {
                        aiEditing: check.subscription?.plan?.includesAiEditing || false,
                        aiCaptions: check.subscription?.plan?.includesAiCaptions || false,
                        aiVoice: check.subscription?.plan?.includesAiVoice || false,
                        aiAvatar: check.subscription?.plan?.includesAiAvatar || false,
                        aiMusic: check.subscription?.plan?.includesAiMusic || false,
                        includes4K: check.subscription?.plan?.includes4K || false,
                    },
                },
            },
            include: {
                mediaFiles: true,
            },
        });
        return project;
    }
    async getUserProjects(userId, page = 1, limit = 20) {
        const [projects, total] = await Promise.all([
            this.prisma.videoProject.findMany({
                where: { userId, isDeleted: false },
                orderBy: { updatedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    mediaFiles: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    _count: {
                        select: { mediaFiles: true },
                    },
                },
            }),
            this.prisma.videoProject.count({
                where: { userId, isDeleted: false },
            }),
        ]);
        return {
            data: projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getProject(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: {
                    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                },
                caption: true,
                aiScript: true,
                musicTrack: true,
                voiceTrack: true,
                templateApplication: {
                    include: { template: true },
                },
                exports: {
                    orderBy: { createdAt: 'desc' },
                },
                processingJobs: {
                    where: { status: { in: ['PENDING', 'PROCESSING'] } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async updateProject(userId, projectId, data) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const updated = await this.prisma.videoProject.update({
            where: { id: projectId },
            data: {
                title: data.title,
                description: data.description,
                aspectRatio: data.aspectRatio,
            },
            include: {
                mediaFiles: true,
                caption: true,
                aiScript: true,
            },
        });
        return updated;
    }
    async deleteProject(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        await this.prisma.videoProject.update({
            where: { id: projectId },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        return { success: true, message: 'Project moved to trash' };
    }
    async updateProjectStatus(userId, projectId, status) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.videoProject.update({
            where: { id: projectId },
            data: { status },
        });
    }
    async updateAiEdits(userId, projectId, editData) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const currentEdits = project.aiEditsApplied || [];
        const updatedEdits = [...currentEdits, { ...editData, appliedAt: new Date() }];
        return this.prisma.videoProject.update({
            where: { id: projectId },
            data: {
                aiEditsApplied: updatedEdits,
                status: editData.status || project.status,
            },
        });
    }
    async getProjectStatus(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            select: {
                id: true,
                status: true,
                processingJobs: {
                    where: { status: { in: ['PENDING', 'PROCESSING'] } },
                    select: {
                        id: true,
                        jobType: true,
                        status: true,
                        progress: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async saveProjectState(userId, projectId, data) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        let duration;
        if (data.state?.timeline?.duration !== undefined) {
            duration = Math.round(data.state.timeline.duration);
        }
        else if (data.state?.composition?.duration !== undefined) {
            duration = Math.round(data.state.composition.duration);
        }
        const versionNumber = await this.prisma.projectVersion.count({
            where: { projectId },
        });
        await this.prisma.$transaction([
            this.prisma.projectVersion.create({
                data: {
                    projectId,
                    versionNumber: versionNumber + 1,
                    snapshot: data.state,
                    changeDescription: 'Manual save from editor',
                },
            }),
            this.prisma.videoProject.update({
                where: { id: projectId },
                data: {
                    duration,
                    thumbnailUrl: data.thumbnailUrl,
                    metadata: {
                        ...project.metadata,
                        lastStateSave: new Date().toISOString(),
                        version: versionNumber + 1,
                    },
                },
            }),
        ]);
        return {
            success: true,
            message: 'Project state saved',
            version: versionNumber + 1,
            savedAt: new Date().toISOString(),
        };
    }
    async loadProjectState(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: {
                    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
                },
                caption: true,
                aiScript: true,
                musicTrack: true,
                voiceTrack: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const latestVersion = await this.prisma.projectVersion.findFirst({
            where: { projectId },
            orderBy: { versionNumber: 'desc' },
        });
        const state = latestVersion?.snapshot || {
            project: {
                id: project.id,
                title: project.title,
                description: project.description,
                aspectRatio: project.aspectRatio,
                duration: project.duration,
            },
            timeline: {
                tracks: [],
                duration: 0,
            },
            composition: {
                elements: [],
            },
            settings: {
                exportSettings: {
                    resolution: '1080p',
                    format: 'mp4',
                    quality: 'high',
                },
            },
        };
        return {
            project: {
                id: project.id,
                title: project.title,
                description: project.description,
                aspectRatio: project.aspectRatio,
                duration: project.duration,
                thumbnailUrl: project.thumbnailUrl,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                mediaFiles: project.mediaFiles,
                caption: project.caption,
                aiScript: project.aiScript,
                musicTrack: project.musicTrack,
                voiceTrack: project.voiceTrack,
            },
            state,
            version: latestVersion?.versionNumber || 1,
            lastSaved: latestVersion?.createdAt || project.createdAt,
        };
    }
    async exportProjectState(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const stateData = await this.loadProjectState(userId, projectId);
        return {
            success: true,
            data: stateData,
            exportFormat: 'json',
            exportedAt: new Date().toISOString(),
        };
    }
    async startExport(userId, projectId, data) {
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
        if (data.resolution === 'P4K' && !metadata?.allowedFeatures?.includes4K) {
            throw new common_1.ForbiddenException('4K export not available on your plan');
        }
        const mainVideo = project.mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
        if (!mainVideo) {
            throw new common_1.NotFoundException('No primary video file found');
        }
        const videoExport = await this.prisma.videoExport.create({
            data: {
                projectId,
                resolution: data.resolution,
                platform: data.platform,
                status: 'PENDING',
            },
        });
        const { QueueService } = await Promise.resolve().then(() => require('../queue/queue.service'));
        const queueService = new QueueService({
            get: (key) => process.env[key],
        });
        await queueService.addJob('export', 'render', {
            exportId: videoExport.id,
            projectId,
            resolution: data.resolution,
            platform: data.platform,
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
        const { StorageService } = await Promise.resolve().then(() => require('../storage/storage.service'));
        const storageService = new StorageService({
            get: (key) => process.env[key],
        });
        const downloadUrl = await storageService.generatePresignedDownloadUrl(videoExport.s3Key, 3600);
        return { downloadUrl, expiresIn: 3600 };
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], VideosService);
//# sourceMappingURL=videos.service.js.map