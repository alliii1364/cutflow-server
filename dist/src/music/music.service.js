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
exports.MusicService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const storage_service_1 = require("../storage/storage.service");
const openai_1 = require("openai");
let MusicService = class MusicService {
    constructor(prisma, queue, storage, configService) {
        this.prisma = prisma;
        this.queue = queue;
        this.storage = storage;
        this.configService = configService;
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY') || '',
        });
    }
    async generateMusic(userId, projectId, params) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { musicTrack: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const metadata = project.metadata;
        if (!metadata?.allowedFeatures?.aiMusic) {
            throw new Error('AI music generation not available on your plan');
        }
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'music_generation',
                status: 'PENDING',
                inputData: {
                    style: params.style,
                    duration: params.duration,
                    mood: params.mood,
                },
            },
        });
        await this.queue.addJob('music', 'generate', {
            jobId: job.id,
            projectId,
            style: params.style,
            duration: params.duration,
            mood: params.mood,
        });
        return { jobId: job.id, status: 'QUEUED' };
    }
    async detectMoodAndMatchMusic(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: {
                mediaFiles: { where: { type: 'MAIN', isPrimary: true } },
                caption: true,
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        let contentForAnalysis = '';
        if (project.caption) {
            contentForAnalysis = project.caption.segments
                .map((s) => s.text)
                .join(' ');
        }
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the content and determine the dominant mood/tone. Return a single word: CALM, ENERGETIC, CORPORATE, EMOTIONAL, UPBEAT, or EPIC.',
                },
                { role: 'user', content: contentForAnalysis || 'Video with no captions' },
            ],
        });
        const detectedMood = response.choices[0].message.content?.trim() || 'UPBEAT';
        const duration = project.duration || 60;
        const job = await this.prisma.processingJob.create({
            data: {
                projectId,
                jobType: 'music_generation',
                status: 'PENDING',
                inputData: {
                    style: detectedMood,
                    duration,
                    mood: detectedMood,
                    autoDetected: true,
                },
            },
        });
        await this.queue.addJob('music', 'generate', {
            jobId: job.id,
            projectId,
            style: detectedMood,
            duration,
            mood: detectedMood,
        });
        return {
            detectedMood,
            jobId: job.id,
            status: 'QUEUED',
        };
    }
    async getBeatSyncTimestamps(musicTrackId, userId) {
        const track = await this.prisma.musicTrack.findFirst({
            where: { id: musicTrackId },
            include: { videoProjects: { where: { userId } } },
        });
        if (!track || track.videoProjects.length === 0) {
            throw new common_1.NotFoundException('Music track not found');
        }
        if (!track.beatTimestamps) {
            const job = await this.queue.addJob('music', 'beat_detection', {
                trackId: musicTrackId,
                s3Key: track.s3Key,
            });
            return {
                status: 'PROCESSING',
                jobId: job.id,
                message: 'Beat detection in progress',
            };
        }
        return {
            status: 'READY',
            beatTimestamps: track.beatTimestamps,
        };
    }
    async assignMusicToProject(userId, projectId, musicTrackId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const track = await this.prisma.musicTrack.findUnique({
            where: { id: musicTrackId },
        });
        if (!track) {
            throw new common_1.NotFoundException('Music track not found');
        }
        await this.prisma.videoProject.update({
            where: { id: projectId },
            data: { musicTrackId },
        });
        return {
            success: true,
            message: 'Music assigned to project',
        };
    }
    async getProjectMusic(userId, projectId) {
        const project = await this.prisma.videoProject.findFirst({
            where: { id: projectId, userId, isDeleted: false },
            include: { musicTrack: true },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project.musicTrack;
    }
};
exports.MusicService = MusicService;
exports.MusicService = MusicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        storage_service_1.StorageService,
        config_1.ConfigService])
], MusicService);
//# sourceMappingURL=music.service.js.map