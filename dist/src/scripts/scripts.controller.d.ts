import { ScriptsService } from './scripts.service';
export declare class ScriptsController {
    private scriptsService;
    constructor(scriptsService: ScriptsService);
    generateScript(userId: string, projectId: string, body: {
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
    generateHooks(userId: string, projectId: string, body: {
        count?: number;
        type?: 'ad' | 'reel' | 'short';
    }): Promise<{
        hooks: any;
    }>;
    applyHook(userId: string, projectId: string, body: {
        hookIndex: number;
    }): Promise<{
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
}
