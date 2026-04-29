import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class CaptionsService {
    private prisma;
    private queue;
    private configService;
    private openai;
    constructor(prisma: PrismaService, queue: QueueService, configService: ConfigService);
    generateCaptions(userId: string, projectId: string, language?: string): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    getCaptions(userId: string, projectId: string): Promise<{
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
    updateCaptions(userId: string, projectId: string, data: {
        segments?: any[];
        style?: any;
        keywords?: string[];
        isAnimated?: boolean;
        wordHighlighting?: boolean;
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
    extractKeywords(userId: string, projectId: string): Promise<{
        keywords: any;
    }>;
    applyAnimatedStyle(userId: string, projectId: string, styleName: string): Promise<{
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
}
