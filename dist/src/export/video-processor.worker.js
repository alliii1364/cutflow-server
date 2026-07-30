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
var VideoProcessorWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoProcessorWorker = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const storage_service_1 = require("../storage/storage.service");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
let VideoProcessorWorker = VideoProcessorWorker_1 = class VideoProcessorWorker {
    constructor(prisma, queue, storage) {
        this.prisma = prisma;
        this.queue = queue;
        this.storage = storage;
        this.logger = new common_1.Logger(VideoProcessorWorker_1.name);
    }
    onModuleInit() {
        this.queue.createWorker('export', async (job) => {
            await this.processExport(job);
        });
        this.logger.log('Video export worker initialized');
    }
    async processExport(job) {
        const { exportId, projectId, resolution, platform, mediaFiles, caption, musicTrack, voiceTrack } = job.data;
        this.logger.log(`Starting export ${exportId} for project ${projectId}`);
        const workDir = path.join(os.tmpdir(), `export-${exportId}`);
        try {
            await this.prisma.videoExport.update({
                where: { id: exportId },
                data: {
                    status: 'PROCESSING',
                    renderStartedAt: new Date(),
                },
            });
            await job.updateProgress(10);
            await fs.mkdir(workDir, { recursive: true });
            const { width, height, videoBitrate } = this.getResolutionSettings(resolution);
            const mainVideo = mediaFiles.find((m) => m.type === 'MAIN' && m.isPrimary);
            if (!mainVideo) {
                throw new Error('No primary video found');
            }
            const inputPath = path.join(workDir, 'input.mp4');
            await this.storage.downloadFile(mainVideo.s3Key, inputPath);
            await job.updateProgress(20);
            const outputPath = path.join(workDir, 'output.mp4');
            let command = ffmpeg(inputPath)
                .size(`${width}x${height}`)
                .videoBitrate(videoBitrate)
                .audioBitrate('192k')
                .format('mp4')
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                '-pix_fmt yuv420p',
                '-preset medium',
                '-movflags +faststart',
            ]);
            if (platform) {
                const platformSettings = this.getPlatformSettings(platform, width, height);
                command = command.size(`${platformSettings.width}x${platformSettings.height}`);
                if (platformSettings.pad) {
                    command = command.outputOptions([
                        `-vf "scale=${platformSettings.width}:${platformSettings.height}:force_original_aspect_ratio=decrease,pad=${platformSettings.width}:${platformSettings.height}:(ow-iw)/2:(oh-ih)/2:black"`,
                    ]);
                }
            }
            if (caption && caption.segments) {
                const subtitlePath = await this.createSubtitleFile(workDir, caption);
                command = command.outputOptions([
                    `-vf "subtitles=${subtitlePath}:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'"`,
                ]);
            }
            if (musicTrack) {
                const musicPath = path.join(workDir, 'music.mp3');
                await this.storage.downloadFile(musicTrack.s3Key, musicPath);
                command = command.input(musicPath)
                    .complexFilter([
                    '[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=3[aout]',
                ])
                    .outputOptions(['-map 0:v', '-map [aout]']);
            }
            if (voiceTrack && !musicTrack) {
                const voicePath = path.join(workDir, 'voice.mp3');
                await this.storage.downloadFile(voiceTrack.s3Key, voicePath);
                command = command.input(voicePath)
                    .complexFilter([
                    '[0:a][1:a]amix=inputs=2:duration=first[aout]',
                ])
                    .outputOptions(['-map 0:v', '-map [aout]']);
            }
            await job.updateProgress(40);
            await new Promise((resolve, reject) => {
                command
                    .on('progress', (progress) => {
                    const percent = Math.round((progress.percent || 0) * 0.5) + 40;
                    job.updateProgress(percent).catch(() => { });
                })
                    .on('end', () => {
                    this.logger.log(`FFmpeg processing completed for export ${exportId}`);
                    resolve();
                })
                    .on('error', (err) => {
                    this.logger.error(`FFmpeg error for export ${exportId}:`, err);
                    reject(err);
                })
                    .save(outputPath);
            });
            await job.updateProgress(90);
            const outputStats = await fs.stat(outputPath);
            const outputKey = `exports/${projectId}/${exportId}.mp4`;
            await this.storage.uploadFile(outputPath, outputKey, 'video/mp4');
            const duration = await this.getVideoDuration(outputPath);
            await job.updateProgress(100);
            await this.prisma.videoExport.update({
                where: { id: exportId },
                data: {
                    status: 'COMPLETED',
                    s3Key: outputKey,
                    s3Url: await this.storage.getFileUrl(outputKey),
                    fileSize: outputStats.size,
                    duration: Math.round(duration),
                    renderCompletedAt: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            this.logger.log(`Export ${exportId} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Export ${exportId} failed:`, error);
            await this.prisma.videoExport.update({
                where: { id: exportId },
                data: {
                    status: 'FAILED',
                    errorMessage: error instanceof Error ? error.message : 'Unknown error',
                    renderCompletedAt: new Date(),
                },
            });
            throw error;
        }
        finally {
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            }
            catch (e) {
                this.logger.warn(`Failed to cleanup work directory ${workDir}:`, e);
            }
        }
    }
    getResolutionSettings(resolution) {
        const settings = {
            P720: { width: 1280, height: 720, videoBitrate: '2500k' },
            P1080: { width: 1920, height: 1080, videoBitrate: '5000k' },
            P4K: { width: 3840, height: 2160, videoBitrate: '20000k' },
        };
        return settings[resolution];
    }
    getPlatformSettings(platform, originalWidth, originalHeight) {
        const platforms = {
            YOUTUBE: { width: 1920, height: 1080, pad: false },
            TIKTOK: { width: 1080, height: 1920, pad: true },
            INSTAGRAM: { width: 1080, height: 1080, pad: true },
            FACEBOOK: { width: 1280, height: 720, pad: false },
            LINKEDIN: { width: 1920, height: 1080, pad: false },
            TWITTER: { width: 1280, height: 720, pad: false },
        };
        return platforms[platform] || { width: originalWidth, height: originalHeight, pad: false };
    }
    async createSubtitleFile(workDir, caption) {
        const subtitlePath = path.join(workDir, 'subtitles.ass');
        let assContent = `[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,0

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
        if (caption.segments && Array.isArray(caption.segments)) {
            for (const segment of caption.segments) {
                const start = this.formatTime(segment.start);
                const end = this.formatTime(segment.end);
                const text = segment.text.replace(/\n/g, '\\N');
                assContent += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
            }
        }
        await fs.writeFile(subtitlePath, assContent, 'utf-8');
        return subtitlePath;
    }
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    async getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(metadata.format.duration || 0);
                }
            });
        });
    }
};
exports.VideoProcessorWorker = VideoProcessorWorker;
exports.VideoProcessorWorker = VideoProcessorWorker = VideoProcessorWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        storage_service_1.StorageService])
], VideoProcessorWorker);
//# sourceMappingURL=video-processor.worker.js.map