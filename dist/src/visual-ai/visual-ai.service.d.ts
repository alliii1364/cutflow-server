import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class VisualAiService {
    private prisma;
    private queue;
    private configService;
    constructor(prisma: PrismaService, queue: QueueService, configService: ConfigService);
    removeBackground(userId: string, projectId: string, options: {
        mediaId?: string;
        backgroundType: 'color' | 'image' | 'video';
        backgroundValue?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    replaceBackground(userId: string, projectId: string, options: {
        backgroundType: 'color' | 'image' | 'video';
        backgroundValue: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    removeWatermark(userId: string, projectId: string, watermarkArea?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    createSimilarStyle(userId: string, projectId: string, referenceVideoUrl: string): Promise<{
        jobId: string;
        status: string;
    }>;
}
