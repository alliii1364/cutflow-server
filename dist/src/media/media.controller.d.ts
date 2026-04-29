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
        id: string;
        createdAt: Date;
        projectId: string;
        s3Key: string;
        duration: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.MediaType;
        originalName: string;
        s3Url: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        isPrimary: boolean;
        timelinePosition: number | null;
    }>;
    getProjectMedia(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        s3Key: string;
        duration: number | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        type: import(".prisma/client").$Enums.MediaType;
        originalName: string;
        s3Url: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        isPrimary: boolean;
        timelinePosition: number | null;
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
        data: {
            id: string;
            name: string;
            subcategories: {
                id: string;
                name: string;
                items: {
                    id: string;
                    name: string;
                    description: string;
                    url: string;
                    thumbnail_url: string;
                    type: "image" | "video";
                    is_premium: boolean;
                }[];
            }[];
        }[];
    }>;
}
