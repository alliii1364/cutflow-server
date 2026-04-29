import { VisualAiService } from './visual-ai.service';
export declare class VisualAiController {
    private visualAiService;
    constructor(visualAiService: VisualAiService);
    removeBackground(userId: string, projectId: string, body: {
        backgroundType: 'color' | 'image' | 'video';
        backgroundValue?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    replaceBackground(userId: string, projectId: string, body: {
        backgroundType: 'color' | 'image' | 'video';
        backgroundValue: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    removeWatermark(userId: string, projectId: string, body: {
        watermarkArea?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    createSimilarStyle(userId: string, projectId: string, body: {
        referenceVideoUrl: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
}
