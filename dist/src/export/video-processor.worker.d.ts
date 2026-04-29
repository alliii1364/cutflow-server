import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
export declare class VideoProcessorWorker implements OnModuleInit {
    private prisma;
    private queue;
    private storage;
    private readonly logger;
    constructor(prisma: PrismaService, queue: QueueService, storage: StorageService);
    onModuleInit(): void;
    private processExport;
    private getResolutionSettings;
    private getPlatformSettings;
    private createSubtitleFile;
    private formatTime;
    private getVideoDuration;
}
