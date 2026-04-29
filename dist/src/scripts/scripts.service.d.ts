import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class ScriptsService {
    private prisma;
    private configService;
    private openai;
    constructor(prisma: PrismaService, configService: ConfigService);
    generateScript(userId: string, projectId: string, params: {
        sourceType: 'url' | 'text' | 'product_page';
        sourceContent: string;
        tone: 'sales' | 'educational' | 'emotional' | 'storytelling';
        targetDuration?: number;
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
    private buildScriptPrompt;
    generateHooks(userId: string, projectId: string, params: {
        count?: number;
        type?: 'ad' | 'reel' | 'short';
    }): Promise<{
        hooks: any;
    }>;
    applyHook(userId: string, projectId: string, hookIndex: number): Promise<{
        message: string;
        selectedHook: any;
        aiScript: {
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
        };
    }>;
    getScript(userId: string, projectId: string): Promise<{
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
}
