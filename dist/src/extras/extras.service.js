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
exports.ExtrasService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const storage_service_1 = require("../storage/storage.service");
const openai_1 = require("openai");
let ExtrasService = class ExtrasService {
    constructor(prisma, queue, storage, configService) {
        this.prisma = prisma;
        this.queue = queue;
        this.storage = storage;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '',
        });
    }
    async getBrandKit(userId) {
        const brandKit = await this.prisma.brandKit.findUnique({
            where: { userId },
        });
        return brandKit || null;
    }
    async updateBrandKit(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: { include: { plan: true } } },
        });
        if (!user?.subscription?.plan?.includesBrandKit) {
            throw new Error('Brand Kit feature not available on your plan');
        }
        return this.prisma.brandKit.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
    }
    async generateThumbnail(userId, projectId, options) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { mediaFiles: { where: { type: 'MAIN', isPrimary: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const mediaFile = project.mediaFiles[0];
        if (!mediaFile) {
            throw new common_1.NotFoundException('No video file found');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'thumbnail_generation',
                status: 'PENDING',
                inputData: {
                    mediaId: mediaFile.id,
                    s3Key: mediaFile.s3Key,
                    frameTime: options.frameTime || 0,
                    text: options.text,
                    style: options.style,
                },
            },
        });
        await this.queue.addJob('extras', 'thumbnail', {
            jobId: job.id,
            projectId,
            mediaId: mediaFile.id,
            s3Key: mediaFile.s3Key,
            ...options,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async saveVersion(userId, projectId, description) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: true,
                caption: true,
                aiScript: true,
                templateApplication: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const lastVersion = await this.prisma.projectVersion.findFirst({
            where: { projectId },
            orderBy: { versionNumber: 'desc' },
        });
        const nextVersion = (lastVersion?.versionNumber || 0) + 1;
        const version = await this.prisma.projectVersion.create({
            data: {
                projectId,
                versionNumber: nextVersion,
                snapshot: project,
                changeDescription: description,
            },
        });
        return version;
    }
    async getVersions(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.projectVersion.findMany({
            where: { projectId },
            orderBy: { versionNumber: 'desc' },
        });
    }
    async restoreVersion(userId, projectId, versionId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const version = await this.prisma.projectVersion.findFirst({
            where: { id: versionId, projectId },
        });
        if (!version) {
            throw new common_1.NotFoundException('Version not found');
        }
        await this.saveVersion(userId, projectId, 'Auto-save before restore');
        const snapshot = version.snapshot;
        await this.prisma.videoProject.update({
            where: { id: projectId },
            data: {
                title: snapshot.title,
                description: snapshot.description,
                metadata: snapshot.metadata,
                aiEditsApplied: snapshot.aiEditsApplied,
            },
        });
        return { success: true, message: `Restored to version ${version.versionNumber}` };
    }
    async createWebhook(userId, url, events) {
        return this.prisma.webhook.create({
            data: {
                userId,
                url,
                events,
                isActive: true,
            },
        });
    }
    async getWebhooks(userId) {
        return this.prisma.webhook.findMany({
            where: { userId },
            include: {
                _count: { select: { deliveries: true } },
            },
        });
    }
    async updateWebhook(userId, webhookId, data) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook not found');
        }
        return this.prisma.webhook.update({
            where: { id: webhookId },
            data,
        });
    }
    async deleteWebhook(userId, webhookId) {
        const webhook = await this.prisma.webhook.findFirst({
            where: { id: webhookId, userId },
        });
        if (!webhook) {
            throw new common_1.NotFoundException('Webhook not found');
        }
        await this.prisma.webhook.delete({
            where: { id: webhookId },
        });
        return { success: true };
    }
    async generateSeoMetadata(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { caption: true, aiScript: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        let content = '';
        if (project.aiScript) {
            content = project.aiScript.generatedScript;
        }
        else if (project.caption) {
            content = project.caption.segments.map((s) => s.text).join(' ');
        }
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Generate SEO metadata for a video. Return JSON with title, description, and hashtags.',
                },
                { role: 'user', content: content.substring(0, 1000) },
            ],
            response_format: { type: 'json_object' },
        });
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return {
            title: result.title || project.title,
            description: result.description || project.description,
            hashtags: result.hashtags || [],
        };
    }
    async getReferralCode(userId) {
        const referral = await this.prisma.referral.findFirst({
            where: { referrerId: userId },
        });
        if (referral) {
            return referral;
        }
        const code = this.generateReferralCode();
        return this.prisma.referral.create({
            data: {
                referrerId: userId,
                referredId: '',
                referralCode: code,
            },
        });
    }
    generateReferralCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
    async applyReferralCode(userId, code) {
        const referral = await this.prisma.referral.findUnique({
            where: { referralCode: code },
        });
        if (!referral) {
            throw new common_1.NotFoundException('Invalid referral code');
        }
        if (referral.referredId) {
            throw new Error('This referral code has already been used');
        }
        if (referral.referrerId === userId) {
            throw new Error('Cannot use your own referral code');
        }
        await this.prisma.referral.update({
            where: { id: referral.id },
            data: { referredId: userId },
        });
        return { success: true, message: 'Referral code applied' };
    }
};
exports.ExtrasService = ExtrasService;
exports.ExtrasService = ExtrasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], ExtrasService);
//# sourceMappingURL=extras.service.js.map