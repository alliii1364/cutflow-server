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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: { plan: true },
                },
                brandKit: true,
                _count: {
                    select: {
                        videoProjects: { where: { isDeleted: false } },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { passwordHash, ...sanitized } = user;
        return {
            ...sanitized,
            videoCount: user._count.videoProjects,
        };
    }
    async updateProfile(userId, data) {
        if (data.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existing && existing.id !== userId) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data,
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
    async uploadAvatar(userId, file) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { key, publicUrl } = await this.storage.generatePresignedUploadUrl('avatars', file.originalname, file.mimetype);
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: publicUrl },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
        const { passwordHash, ...sanitized } = updated;
        return sanitized;
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        return { success: true, message: 'Password changed successfully' };
    }
    async getUsageStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const totalVideos = await this.prisma.videoProject.count({
            where: { userId, isDeleted: false },
        });
        const exportedVideos = await this.prisma.videoExport.count({
            where: {
                project: { userId },
                status: 'COMPLETED',
            },
        });
        const recentExports = await this.prisma.videoExport.findMany({
            where: {
                project: { userId },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                project: {
                    select: { title: true, thumbnailUrl: true },
                },
            },
        });
        const storageAgg = await this.prisma.mediaFile.aggregate({
            where: { project: { userId } },
            _sum: { size: true },
        });
        const storageUsed = storageAgg._sum.size ?? 0;
        return {
            subscription: user.subscription,
            videoQuota: {
                used: totalVideos,
                limit: user.subscription?.plan?.videoLimit || 0,
            },
            storage: {
                used: storageUsed,
                limit: (user.subscription?.plan?.maxStorageGb || 1) * 1024 * 1024 * 1024,
            },
            totalVideos,
            exportedVideos,
            recentExports,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], UsersService);
//# sourceMappingURL=users.service.js.map