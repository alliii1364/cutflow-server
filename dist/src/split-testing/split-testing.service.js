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
exports.SplitTestingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let SplitTestingService = class SplitTestingService {
    constructor(prisma, queue) {
        this.prisma = prisma;
        this.queue = queue;
    }
    async createSplitTest(userId, projectId, options) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                aiScript: true,
                caption: true,
                musicTrack: true,
                voiceTrack: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const variants = [];
        const count = options.variantCount || 4;
        const hooks = project.aiScript?.hookVariants || [];
        const captionStyles = [
            { name: 'Bold', font: 'Impact', color: '#FFFFFF' },
            { name: 'Modern', font: 'Inter', color: '#000000' },
            { name: 'Fun', font: 'Comic Sans', color: '#FF6B6B' },
        ];
        const musicStyles = ['UPBEAT', 'CALM', 'EPIC', 'CORPORATE'];
        for (let i = 0; i < count; i++) {
            const variant = {
                id: `variant-${i + 1}`,
                name: `Variant ${i + 1}`,
                changes: {},
            };
            if (options.testHooks && hooks.length > i) {
                variant.changes.hook = hooks[i];
            }
            if (options.testCaptions) {
                variant.changes.captionStyle = captionStyles[i % captionStyles.length];
            }
            if (options.testMusic) {
                variant.changes.musicStyle = musicStyles[i % musicStyles.length];
            }
            if (options.testVoice) {
                variant.changes.voice = { pitch: 1 + (i * 0.1) };
            }
            variants.push(variant);
        }
        const session = await this.prisma.splitTestSession.create({
            data: {
                projectId,
                name: `Split Test ${new Date().toLocaleDateString()}`,
                variants,
                totalVariants: variants.length,
                status: 'PENDING',
            },
        });
        return session;
    }
    async getVariants(userId, sessionId) {
        const session = await this.prisma.splitTestSession.findFirst({
            where: { id: sessionId, project: { userId } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Split test session not found');
        }
        return {
            session,
            variants: session.variants,
        };
    }
    async exportAllVariants(userId, sessionId) {
        const session = await this.prisma.splitTestSession.findFirst({
            where: { id: sessionId, project: { userId } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Split test session not found');
        }
        const variants = session.variants;
        for (const variant of variants) {
            await this.queue.addJob('export', 'render-variant', {
                sessionId,
                variantId: variant.id,
                projectId: session.projectId,
                variantChanges: variant.changes,
            });
        }
        await this.prisma.splitTestSession.update({
            where: { id: sessionId },
            data: { status: 'PROCESSING' },
        });
        return {
            sessionId,
            status: 'PROCESSING',
            message: `Queued ${variants.length} variants for export`,
        };
    }
    async getExportStatus(userId, sessionId) {
        const session = await this.prisma.splitTestSession.findFirst({
            where: { id: sessionId, project: { userId } },
        });
        if (!session) {
            throw new common_1.NotFoundException('Split test session not found');
        }
        return session;
    }
};
exports.SplitTestingService = SplitTestingService;
exports.SplitTestingService = SplitTestingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], SplitTestingService);
//# sourceMappingURL=split-testing.service.js.map