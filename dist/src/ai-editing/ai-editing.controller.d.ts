import { AiEditingService } from './ai-editing.service';
export declare class AiEditingController {
    private aiEditingService;
    constructor(aiEditingService: AiEditingService);
    removeSilence(userId: string, projectId: string, body: {
        threshold?: number;
        minDuration?: number;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    resizeVideo(userId: string, projectId: string, body: {
        aspectRatio: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    applyFilters(userId: string, projectId: string, body: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        blur?: number;
        preset?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    addZoomEffects(userId: string, projectId: string, body: {
        timestamps: number[];
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    getJobStatus(userId: string, jobId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        progress: number;
        projectId: string;
        errorMessage: string | null;
        jobType: string;
        inputData: import("@prisma/client/runtime/library").JsonValue;
        outputData: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date | null;
        completedAt: Date | null;
        bullJobId: string | null;
    }>;
    getProjectJobs(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        progress: number;
        projectId: string;
        errorMessage: string | null;
        jobType: string;
        inputData: import("@prisma/client/runtime/library").JsonValue;
        outputData: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date | null;
        completedAt: Date | null;
        bullJobId: string | null;
    }[]>;
}
