import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../queue/queue.service';
export type ScriptTone = 'sales' | 'educational' | 'emotional' | 'storytelling' | 'professional';
export interface ScriptGenerationRequest {
    sourceType: 'website' | 'text' | 'product';
    sourceContent: string;
    tone: ScriptTone;
    duration?: number;
    language?: string;
}
export interface GeneratedScript {
    title: string;
    content: string;
    estimatedDuration: number;
    wordCount: number;
    suggestedBrolls: string[];
}
export interface GeneratedHook {
    text: string;
    type: 'question' | 'statistic' | 'story' | 'challenge' | 'benefit';
    estimatedDuration: number;
}
export declare class ScriptService {
    private configService;
    private prisma;
    private queue;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, prisma: PrismaService, queue: QueueService);
    generateScript(projectId: string, request: ScriptGenerationRequest): Promise<{
        jobId: string;
        status: string;
    }>;
    processScriptGeneration(jobData: {
        projectId: string;
        request: ScriptGenerationRequest;
    }): Promise<GeneratedScript>;
    generateHooks(projectId: string, sourceContent: string, count?: number): Promise<GeneratedHook[]>;
    getScript(projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        projectId: string;
        language: string;
        sourceType: string;
        sourceContent: string | null;
        sourceUrl: string | null;
        tone: string;
        generatedScript: string;
        suggestedBrolls: string[];
        hookVariants: import("@prisma/client/runtime/library").JsonValue;
        selectedHookIndex: number;
        wordCount: number | null;
        estimatedDuration: number | null;
    }>;
    updateScript(projectId: string, updates: {
        content?: string;
        title?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        projectId: string;
        language: string;
        sourceType: string;
        sourceContent: string | null;
        sourceUrl: string | null;
        tone: string;
        generatedScript: string;
        suggestedBrolls: string[];
        hookVariants: import("@prisma/client/runtime/library").JsonValue;
        selectedHookIndex: number;
        wordCount: number | null;
        estimatedDuration: number | null;
    }>;
    deleteScript(projectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private fetchWebsiteContent;
    private buildScriptPrompt;
    private extractBrollSuggestions;
    private extractTopic;
}
