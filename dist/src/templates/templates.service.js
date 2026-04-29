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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TemplatesService = class TemplatesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTemplates(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const where = { isActive: true };
        if (filters.category)
            where.category = filters.category;
        if (filters.platform)
            where.aspectRatios = { has: filters.platform };
        if (filters.industry)
            where.industry = filters.industry;
        if (filters.style)
            where.style = filters.style;
        if (filters.tier)
            where.tier = filters.tier;
        const [templates, total] = await Promise.all([
            this.prisma.template.findMany({
                where,
                orderBy: { sortOrder: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.template.count({ where }),
        ]);
        return {
            data: templates,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTemplateById(templateId) {
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async applyTemplate(userId, projectId, templateId, customConfig) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { templateApplication: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        if (project.templateApplication) {
            await this.prisma.templateApplication.delete({
                where: { id: project.templateApplication.id },
            });
        }
        const application = await this.prisma.templateApplication.create({
            data: {
                projectId,
                templateId,
                appliedConfig: customConfig || template.config,
            },
        });
        await this.prisma.videoProject.update({
            where: { id: projectId },
            data: {
                aspectRatio: template.aspectRatios[0] || '16:9',
            },
        });
        return application;
    }
    async getAssets(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const where = { isActive: true };
        if (filters.type)
            where.type = filters.type;
        if (filters.category)
            where.category = filters.category;
        if (filters.tier)
            where.tier = filters.tier;
        if (filters.tags)
            where.tags = { hasSome: filters.tags };
        const [assets, total] = await Promise.all([
            this.prisma.creativeAsset.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.creativeAsset.count({ where }),
        ]);
        return {
            data: assets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAssetById(assetId) {
        const asset = await this.prisma.creativeAsset.findUnique({
            where: { id: assetId },
        });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async saveUserTemplate(userId, templateId, customName, customConfig) {
        const template = await this.prisma.template.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        const userTemplate = await this.prisma.userTemplate.upsert({
            where: {
                userId_templateId: { userId, templateId },
            },
            create: {
                userId,
                templateId,
                customName,
                customConfig,
            },
            update: {
                customName,
                customConfig,
            },
        });
        return userTemplate;
    }
    async getUserTemplates(userId) {
        return this.prisma.userTemplate.findMany({
            where: { userId },
            include: { template: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteUserTemplate(userId, templateId) {
        await this.prisma.userTemplate.deleteMany({
            where: { userId, templateId },
        });
        return { success: true };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map