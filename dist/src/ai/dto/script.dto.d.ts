export declare enum ScriptTone {
    SALES = "sales",
    EDUCATIONAL = "educational",
    EMOTIONAL = "emotional",
    STORYTELLING = "storytelling",
    PROFESSIONAL = "professional"
}
export declare class GenerateScriptDto {
    sourceType: 'website' | 'text' | 'product';
    sourceContent: string;
    tone: ScriptTone;
    duration?: number;
    language?: string;
}
export declare class GenerateHooksDto {
    sourceContent: string;
    count?: number;
}
export declare class UpdateScriptDto {
    title?: string;
    content?: string;
}
export declare class ApplyScriptDto {
    createClips?: boolean;
    generateVoice?: boolean;
}
