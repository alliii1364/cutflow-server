import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { VideosService } from '../videos/videos.service';
export declare class AiEditingService {
    private prisma;
    private queue;
    private videosService;
    constructor(prisma: PrismaService, queue: QueueService, videosService: VideosService);
    removeSilence(userId: string, projectId: string, options?: {
        threshold?: number;
        minDuration?: number;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    resizeVideo(userId: string, projectId: string, targetAspectRatio: string): Promise<{
        jobId: string;
        status: string;
    }>;
    applyFilters(userId: string, projectId: string, filters: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        blur?: number;
        preset?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    addZoomEffects(userId: string, projectId: string, timestamps: number[]): Promise<{
        jobId: string;
        status: string;
    }>;
    getJobStatus(jobId: string, userId: string): Promise<{
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
    getProjectJobs(projectId: string, userId: string): Promise<{
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
