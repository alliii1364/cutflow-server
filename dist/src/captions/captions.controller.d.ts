import { CaptionsService } from './captions.service';
export declare class CaptionsController {
    private captionsService;
    constructor(captionsService: CaptionsService);
    generateCaptions(userId: string, projectId: string, body: {
        language?: string;
    }): Promise<{
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
    updateCaptions(userId: string, projectId: string, body: {
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
    applyAnimatedStyle(userId: string, projectId: string, body: {
        style: string;
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
}
