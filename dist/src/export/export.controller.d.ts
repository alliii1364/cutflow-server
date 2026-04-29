import { ExportService } from './export.service';
export declare class ExportController {
    private exportService;
    constructor(exportService: ExportService);
    queueExport(userId: string, projectId: string, body: {
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        progress: number;
        errorMessage: string | null;
        projectId: string;
        s3Key: string | null;
        duration: number | null;
        s3Url: string | null;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        expiresAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }>;
    getDownloadUrl(userId: string, exportId: string): Promise<{
        downloadUrl: string;
        expiresIn: number;
    }>;
    getProjectExports(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        progress: number;
        errorMessage: string | null;
        projectId: string;
        s3Key: string | null;
        duration: number | null;
        s3Url: string | null;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        expiresAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }[]>;
    pushToGoogleDrive(userId: string, exportId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
