import { MediaService } from './media.service';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    getPresignedUrl(userId: string, body: {
        fileName: string;
        contentType: string;
        fileSize: number;
        isBroll?: boolean;
    }): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
        maxDuration: any;
        expiresIn: number;
    }>;
    confirmUpload(userId: string, body: {
        projectId: string;
        key: string;
        publicUrl: string;
        fileData: {
            originalName: string;
            mimeType: string;
            size: number;
            duration?: number;
            width?: number;
            height?: number;
        };
        isBroll?: boolean;
    }): Promise<{
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        s3Key: string;
        s3Url: string;
        type: import(".prisma/client").$Enums.MediaType;
        duration: number | null;
        createdAt: Date;
        size: number;
        projectId: string;
        width: number | null;
        height: number | null;
        timelinePosition: number | null;
        originalName: string;
        mimeType: string;
        isPrimary: boolean;
    }>;
    getProjectMedia(userId: string, projectId: string): Promise<{
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        s3Key: string;
        s3Url: string;
        type: import(".prisma/client").$Enums.MediaType;
        duration: number | null;
        createdAt: Date;
        size: number;
        projectId: string;
        width: number | null;
        height: number | null;
        timelinePosition: number | null;
        originalName: string;
        mimeType: string;
        isPrimary: boolean;
    }[]>;
    deleteMedia(userId: string, mediaId: string): Promise<{
        success: boolean;
    }>;
    initiateGoogleDriveAuth(userId: string): Promise<{
        authUrl: string;
    }>;
    importFromGoogleDrive(userId: string, body: {
        driveFileId: string;
        projectId: string;
    }): Promise<void>;
    searchStockFootage(query: string, page: number, perPage: number): Promise<{
        results: any[];
        page: number;
        perPage: number;
        total: number;
    }>;
    generateAiBroll(userId: string, body: {
        projectId: string;
        prompt: string;
    }): Promise<{
        mediaId: string;
        status: string;
        message: string;
    }>;
    getBrollLibrary(): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
