import { CaptionService } from '../services/caption.service';
import { ScriptService } from '../services/script.service';
import { GenerateCaptionsDto, UpdateCaptionsDto } from '../dto/caption.dto';
import { GenerateScriptDto, GenerateHooksDto, UpdateScriptDto, ApplyScriptDto } from '../dto/script.dto';
export declare class AIController {
    private captionService;
    private scriptService;
    constructor(captionService: CaptionService, scriptService: ScriptService);
    generateCaptions(userId: string, projectId: string, dto: GenerateCaptionsDto): Promise<{
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
    updateCaptions(userId: string, projectId: string, dto: UpdateCaptionsDto): Promise<{
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
    deleteCaptions(userId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generateScript(userId: string, projectId: string, dto: GenerateScriptDto): Promise<{
        jobId: string;
        status: string;
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
    updateScript(userId: string, projectId: string, dto: UpdateScriptDto): Promise<{
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
    deleteScript(userId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generateHooks(userId: string, dto: GenerateHooksDto): Promise<import("../services/script.service").GeneratedHook[]>;
    applyScript(userId: string, projectId: string, dto: ApplyScriptDto): Promise<{
        success: boolean;
        message: string;
        createClips: boolean;
        generateVoice: boolean;
    }>;
}
