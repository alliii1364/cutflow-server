import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
import { StorageService } from '../../storage/storage.service';
interface CaptionSegment {
    start: number;
    end: number;
    text: string;
    words?: Array<{
        word: string;
        start: number;
        end: number;
    }>;
}
export declare class CaptionService {
    private configService;
    private prisma;
    private queue;
    private storage;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, prisma: PrismaService, queue: QueueService, storage: StorageService);
    generateCaptions(projectId: string, language?: string, style?: {
        font?: string;
        color?: string;
        size?: number;
        position?: 'top' | 'bottom' | 'middle';
        animated?: boolean;
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    processCaptionGeneration(jobData: {
        projectId: string;
        videoKey: string;
        language: string;
        style?: any;
    }): Promise<void>;
    getCaptions(projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        language: string;
        segments: import("@prisma/client/runtime/library").JsonValue;
        style: import("@prisma/client/runtime/library").JsonValue;
        keywords: string[];
        isAnimated: boolean;
        wordHighlighting: boolean;
        confidence: number | null;
    }>;
    updateCaptions(projectId: string, updates: {
        segments?: CaptionSegment[];
        style?: any;
        isAnimated?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        language: string;
        segments: import("@prisma/client/runtime/library").JsonValue;
        style: import("@prisma/client/runtime/library").JsonValue;
        keywords: string[];
        isAnimated: boolean;
        wordHighlighting: boolean;
        confidence: number | null;
    }>;
    deleteCaptions(projectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    burnCaptionsIntoVideo(projectId: string, exportId: string, videoPath: string, outputPath: string): Promise<void>;
    private generateASSFile;
    private hexToASSColor;
    private formatASSTime;
}
export {};
