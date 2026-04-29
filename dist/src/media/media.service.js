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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let MediaService = class MediaService {
    constructor(prisma, storage, subscriptionsService) {
        this.prisma = prisma;
        this.storage = storage;
        this.subscriptionsService = subscriptionsService;
    }
    async getPresignedUploadUrl(userId, fileName, contentType, fileSize, isBroll = false) {
        const check = await this.subscriptionsService.checkVideoCreationAllowed(userId);
        if (!check.allowed) {
            throw new Error(check.reason);
        }
        const maxDuration = check.subscription?.plan?.maxVideoDuration || 60;
        const folder = isBroll ? 'broll' : 'videos';
        const { uploadUrl, key, publicUrl } = await this.storage.generatePresignedUploadUrl(`${folder}/${userId}`, fileName, contentType);
        return {
            uploadUrl,
            key,
            publicUrl,
            maxDuration,
            expiresIn: 300,
        };
    }
    async confirmUpload(userId, projectId, key, publicUrl, fileData, isBroll = false) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = await this.prisma.mediaFile.create({
            data: {
                projectId,
                type: isBroll ? 'BROLL' : 'MAIN',
                originalName: fileData.originalName,
                s3Key: key,
                s3Url: publicUrl,
                mimeType: fileData.mimeType,
                size: fileData.size,
                duration: fileData.duration,
                width: fileData.width,
                height: fileData.height,
                isPrimary: !isBroll,
            },
        });
        if (!isBroll && fileData.duration) {
            await this.prisma.videoProject.update({
                where: { id: projectId },
                data: {
                    duration: fileData.duration,
                    metadata: {
                        width: fileData.width,
                        height: fileData.height,
                    },
                },
            });
        }
        return mediaFile;
    }
    async getProjectMedia(projectId, userId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.mediaFiles;
    }
    async deleteMediaFile(mediaId, userId) {
        const mediaFile = await this.prisma.mediaFile.findFirst({
            where: { id: mediaId },
            include: { project: true },
        });
        if (!mediaFile || mediaFile.project.userId !== userId) {
            throw new common_1.NotFoundException('Media file not found');
        }
        await this.storage.deleteFile(mediaFile.s3Key);
        await this.prisma.mediaFile.delete({
            where: { id: mediaId },
        });
        return { success: true };
    }
    async initiateGoogleDriveAuth(userId) {
        return {
            authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.FRONTEND_URL}/drive/callback&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly`,
        };
    }
    async importFromGoogleDrive(userId, driveFileId, projectId) {
        throw new Error('Google Drive import not yet implemented');
    }
    async searchStockFootage(query, page = 1, perPage = 20) {
        return {
            results: [],
            page,
            perPage,
            total: 0,
        };
    }
    async generateAiBroll(userId, projectId, prompt) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = await this.prisma.mediaFile.create({
            data: {
                projectId,
                type: 'AI_GENERATED',
                originalName: 'ai-broll.mp4',
                s3Key: `pending/${projectId}/ai-broll`,
                s3Url: '',
                mimeType: 'video/mp4',
                size: 0,
            },
        });
        return {
            mediaId: mediaFile.id,
            status: 'PENDING',
            message: 'AI B-roll generation queued',
        };
    }
    async getBrollLibrary() {
        const categories = await this.prisma.brollCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                subcategories: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        items: {
                            where: { isActive: true },
                            orderBy: { sortOrder: 'asc' },
                        },
                    },
                },
            },
        });
        return {
            success: true,
            data: categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
                subcategories: cat.subcategories.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                    items: sub.items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        url: item.s3Url,
                        thumbnail_url: item.thumbnailUrl,
                        type: item.type,
                        is_premium: item.isPremium,
                    })),
                })),
            })),
        };
    }
    async createBrollCategory(name, sortOrder = 0) {
        return this.prisma.brollCategory.create({
            data: { name, sortOrder },
        });
    }
    async createBrollSubcategory(categoryId, name, sortOrder = 0) {
        return this.prisma.brollSubcategory.create({
            data: { categoryId, name, sortOrder },
        });
    }
    async createBrollItem(subcategoryId, data, sortOrder = 0) {
        return this.prisma.brollItem.create({
            data: {
                subcategoryId,
                name: data.name,
                description: data.description,
                s3Key: data.s3Key,
                s3Url: data.s3Url,
                thumbnailUrl: data.thumbnailUrl,
                type: data.type || 'video',
                isPremium: data.isPremium || false,
                duration: data.duration,
                sortOrder,
            },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        subscriptions_service_1.SubscriptionsService])
], MediaService);
//# sourceMappingURL=media.service.js.map