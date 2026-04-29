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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsers(page = 1, limit = 50, search) {
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    subscription: { include: { plan: true } },
                    _count: {
                        select: {
                            videoProjects: { where: { isDeleted: false } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map((u) => ({
                ...u,
                videoCount: u._count.videoProjects,
                _count: undefined,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async updateUser(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updates = {};
        if (data.role)
            updates.role = data.role;
        if (data.isActive !== undefined)
            updates.isActive = data.isActive;
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: updates,
            include: { subscription: { include: { plan: true } } },
        });
        if (data.planId) {
            await this.prisma.subscription.update({
                where: { userId },
                data: { planId: data.planId },
            });
        }
        return updated;
    }
    async getAllSubscriptions(page = 1, limit = 50) {
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                include: { user: { select: { id: true, email: true, firstName: true, lastName: true } }, plan: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.subscription.count(),
        ]);
        return {
            data: subscriptions,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async createTemplate(data) {
        return this.prisma.template.create({
            data,
        });
    }
    async updateTemplate(templateId, data) {
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return this.prisma.template.update({
            where: { id: templateId },
            data,
        });
    }
    async deleteTemplate(templateId) {
        await this.prisma.template.delete({
            where: { id: templateId },
        });
        return { success: true };
    }
    async createAsset(data) {
        return this.prisma.creativeAsset.create({
            data,
        });
    }
    async updateAsset(assetId, data) {
        const asset = await this.prisma.creativeAsset.findUnique({
            where: { id: assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return this.prisma.creativeAsset.update({
            where: { id: assetId },
            data,
        });
    }
    async getFeatureFlags() {
        return this.prisma.featureFlag.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async createFeatureFlag(data) {
        return this.prisma.featureFlag.create({
            data,
        });
    }
    async updateFeatureFlag(flagId, data) {
        const flag = await this.prisma.featureFlag.findUnique({
            where: { id: flagId },
        });
        if (!flag) {
            throw new common_1.NotFoundException('Feature flag not found');
        }
        return this.prisma.featureFlag.update({
            where: { id: flagId },
            data,
        });
    }
    async getPlatformOverview() {
        const [totalUsers, activeUsers24h, totalVideos, totalExports, revenueData,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({
                where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
            }),
            this.prisma.videoProject.count({ where: { isDeleted: false } }),
            this.prisma.videoExport.count({ where: { status: 'COMPLETED' } }),
            this.prisma.subscription.aggregate({
                _sum: { videoCount: true },
                where: { status: 'ACTIVE' },
            }),
        ]);
        return {
            users: { total: totalUsers, active24h: activeUsers24h },
            videos: { total: totalVideos },
            exports: { total: totalExports },
            subscriptions: { active: revenueData._sum.videoCount || 0 },
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map