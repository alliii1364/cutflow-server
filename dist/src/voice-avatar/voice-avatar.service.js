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
exports.VoiceAvatarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let VoiceAvatarService = class VoiceAvatarService {
    constructor(prisma, queue, configService) {
        this.prisma = prisma;
        this.queue = queue;
        this.configService = configService;
    }
    async getAvailableVoices() {
        return {
            voices: [
                { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'Female', age: 'Young' },
                { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American', gender: 'Female', age: 'Young' },
                { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American', gender: 'Female', age: 'Young' },
                { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American', gender: 'Male', age: 'Young' },
                { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'American', gender: 'Female', age: 'Young' },
                { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American', gender: 'Male', age: 'Young' },
                { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', accent: 'American', gender: 'Male', age: 'Old' },
                { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American', gender: 'Male', age: 'Middle' },
            ],
        };
    }
    async generateVoiceover(userId, projectId, params) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true, voiceTrack: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiVoice) {
            throw new Error('AI voice generation not available on your plan');
        }
        const script = params.script || project.aiScript?.generatedScript;
        if (!script) {
            throw new common_1.NotFoundException('No script found. Generate a script first.');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'voice_generation',
                status: 'PENDING',
                inputData: {
                    script,
                    voiceId: params.voiceId,
                    voiceName: params.voiceName,
                },
            },
        });
        await this.queue.addJob('voice', 'generate', {
            jobId: job.id,
            projectId,
            script,
            voiceId: params.voiceId,
            voiceName: params.voiceName,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async getAvatarOptions() {
        return {
            avatars: [
                { id: 'professional_female', name: 'Professional Female', style: 'business' },
                { id: 'casual_male', name: 'Casual Male', style: 'casual' },
                { id: 'young_creator', name: 'Young Creator', style: 'trendy' },
                { id: 'expert_professor', name: 'Expert Professor', style: 'educational' },
                { id: 'friendly_host', name: 'Friendly Host', style: 'friendly' },
            ],
        };
    }
    async generateAvatar(userId, projectId, params) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { aiScript: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiAvatar) {
            throw new Error('AI avatar generation not available on your plan');
        }
        const script = params.script || project.aiScript?.generatedScript;
        if (!script) {
            throw new common_1.NotFoundException('No script found. Generate a script first.');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'avatar_generation',
                status: 'PENDING',
                inputData: {
                    avatarId: params.avatarId,
                    script,
                    voiceId: params.voiceId,
                },
            },
        });
        await this.queue.addJob('avatar', 'generate', {
            jobId: job.id,
            projectId,
            avatarId: params.avatarId,
            script,
            voiceId: params.voiceId,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async assignVoiceToProject(userId, projectId, voiceTrackId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        await this.prisma.videoProject.update({
            where: { id: projectId },
            data: { voiceTrackId },
        });
        return { success: true };
    }
};
exports.VoiceAvatarService = VoiceAvatarService;
exports.VoiceAvatarService = VoiceAvatarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        config_1.ConfigService])
], VoiceAvatarService);
//# sourceMappingURL=voice-avatar.service.js.map