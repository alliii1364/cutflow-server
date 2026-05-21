import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
export declare class ExportService {
    private prisma;
    private queue;
    private storage;
    constructor(prisma: PrismaService, queue: QueueService, storage: StorageService);
    queueExport(userId: string, projectId: string, options: {
        resolution: 'P720' | 'P1080' | 'P4K';
        platform?: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TWITTER';
    }): Promise<{
        exportId: string;
        status: string;
        message: string;
    }>;
    getExportStatus(userId: string, exportId: string): Promise<{
        project: {
            title: string;
        };
    } & {
        id: string;
        s3Key: string | null;
        s3Url: string | null;
        duration: number | null;
        createdAt: Date;
        updatedAt: Date;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        expiresAt: Date | null;
        projectId: string;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        errorMessage: string | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }>;
    getExportDownloadUrl(userId: string, exportId: string): Promise<{
        downloadUrl: string;
        expiresIn: number;
    }>;
    getProjectExports(userId: string, projectId: string): Promise<{
        id: string;
        s3Key: string | null;
        s3Url: string | null;
        duration: number | null;
        createdAt: Date;
        updatedAt: Date;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        expiresAt: Date | null;
        projectId: string;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        errorMessage: string | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }[]>;
    pushToGoogleDrive(userId: string, exportId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
