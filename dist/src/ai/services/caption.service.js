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
var CaptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const queue_service_1 = require("../../queue/queue.service");
const storage_service_1 = require("../../storage/storage.service");
const openai_1 = require("openai");
const fs = require("fs/promises");
const fs_1 = require("fs");
const path = require("path");
const os = require("os");
let CaptionService = CaptionService_1 = class CaptionService {
    constructor(configService, prisma, queue, storage) {
        this.configService = configService;
        this.prisma = prisma;
        this.queue = queue;
        this.storage = storage;
        this.logger = new common_1.Logger(CaptionService_1.name);
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey });
        }
    }
    async generateCaptions(projectId, language = 'en', style) {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }
        const project = await this.prisma.videoProject.findUnique({
            where: { id: projectId },
            include: { mediaFiles: true },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        const mainVideo = project.mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
        if (!mainVideo) {
            throw new Error('No primary video found');
        }
        const job = await this.queue.addJob('captions', 'generate', {
            projectId,
            videoKey: mainVideo.s3Key,
            language,
            style,
        });
        return {
            jobId: job.id,
            status: 'PENDING',
            message: 'Caption generation queued',
        };
    }
    async processCaptionGeneration(jobData) {
        const { projectId, videoKey, language, style } = jobData;
        const workDir = path.join(os.tmpdir(), `captions-${projectId}`);
        try {
            this.logger.log(`Starting caption generation for project ${projectId}`);
            await fs.mkdir(workDir, { recursive: true });
            const videoPath = path.join(workDir, 'video.mp4');
            await this.storage.downloadFile(videoKey, videoPath);
            const transcription = await this.openai.audio.transcriptions.create({
                file: (0, fs_1.createReadStream)(videoPath),
                model: 'whisper-1',
                language: language === 'auto' ? undefined : language,
                response_format: 'verbose_json',
                timestamp_granularities: ['word', 'segment'],
            });
            const segments = transcription.segments?.map((seg) => ({
                start: seg.start,
                end: seg.end,
                text: seg.text.trim(),
                words: seg.words?.map((w) => ({
                    word: w.word,
                    start: w.start,
                    end: w.end,
                })),
            })) || [];
            const allText = segments.map((s) => s.text).join(' ');
            const words = allText.split(/\s+/);
            const keywords = words
                .filter((w) => w.length > 5 || /^[A-Z]/.test(w))
                .filter((w) => !['this', 'that', 'with', 'from', 'they', 'have'].includes(w.toLowerCase()))
                .slice(0, 10);
            await this.prisma.caption.upsert({
                where: { projectId },
                create: {
                    projectId,
                    language,
                    segments: segments,
                    style: style || {},
                    keywords,
                    isAnimated: style?.animated || false,
                },
                update: {
                    language,
                    segments: segments,
                    style: style || {},
                    keywords,
                    isAnimated: style?.animated || false,
                    updatedAt: new Date(),
                },
            });
            await this.prisma.videoProject.update({
                where: { id: projectId },
                data: { status: 'READY' },
            });
            this.logger.log(`Caption generation completed for project ${projectId}`);
        }
        catch (error) {
            this.logger.error(`Caption generation failed for project ${projectId}:`, error);
            throw error;
        }
        finally {
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            }
            catch (e) {
                this.logger.warn(`Failed to cleanup work directory:`, e);
            }
        }
    }
    async getCaptions(projectId) {
        const caption = await this.prisma.caption.findUnique({
            where: { projectId },
        });
        if (!caption) {
            throw new Error('No captions found for this project');
        }
        return caption;
    }
    async updateCaptions(projectId, updates) {
        const caption = await this.prisma.caption.update({
            where: { projectId },
            data: {
                updatedAt: new Date(),
                ...(updates.segments !== undefined && { segments: updates.segments }),
                ...(updates.style !== undefined && { style: updates.style }),
                ...(updates.isAnimated !== undefined && { isAnimated: updates.isAnimated }),
            },
        });
        return caption;
    }
    async deleteCaptions(projectId) {
        await this.prisma.caption.delete({
            where: { projectId },
        });
        return { success: true, message: 'Captions deleted' };
    }
    async burnCaptionsIntoVideo(projectId, exportId, videoPath, outputPath) {
        const caption = await this.prisma.caption.findUnique({
            where: { projectId },
        });
        if (!caption) {
            this.logger.warn(`No captions found for project ${projectId}, skipping burn-in`);
            return;
        }
        const subtitlePath = path.join(path.dirname(videoPath), 'subtitles.ass');
        await this.generateASSFile(caption, subtitlePath);
        this.logger.log(`Generated subtitle file for burn-in: ${subtitlePath}`);
    }
    async generateASSFile(caption, outputPath) {
        const style = caption.style || {};
        const fontName = style.font || 'Arial';
        const fontSize = style.size || 24;
        const primaryColor = this.hexToASSColor(style.color || '#FFFFFF');
        const position = style.position || 'bottom';
        const alignment = position === 'top' ? 8 : position === 'middle' ? 5 : 2;
        let assContent = `[Script Info]
Title: Generated Captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,${alignment},10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
        if (caption.segments && Array.isArray(caption.segments)) {
            for (const segment of caption.segments) {
                const start = this.formatASSTime(segment.start);
                const end = this.formatASSTime(segment.end);
                const text = segment.text.replace(/\n/g, '\\N');
                assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
            }
        }
        await fs.writeFile(outputPath, assContent, 'utf-8');
    }
    hexToASSColor(hex) {
        const clean = hex.replace('#', '');
        const r = clean.substring(0, 2);
        const g = clean.substring(2, 4);
        const b = clean.substring(4, 6);
        return `&H00${b}${g}${r}`;
    }
    formatASSTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const centis = Math.floor((seconds % 1) * 100);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
    }
};
exports.CaptionService = CaptionService;
exports.CaptionService = CaptionService = CaptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        storage_service_1.StorageService])
], CaptionService);
//# sourceMappingURL=caption.service.js.map