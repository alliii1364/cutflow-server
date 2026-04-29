import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export declare class MediaService {
    private prisma;
    private storage;
    private subscriptionsService;
    constructor(prisma: PrismaService, storage: StorageService, subscriptionsService: SubscriptionsService);
    getPresignedUploadUrl(userId: string, fileName: string, contentType: string, fileSize: number, isBroll?: boolean): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
        maxDuration: any;
        expiresIn: number;
    }>;
    confirmUpload(userId: string, projectId: string, key: string, publicUrl: string, fileData: {
        originalName: string;
        mimeType: string;
        size: number;
        duration?: number;
        width?: number;
        height?: number;
    }, isBroll?: boolean): Promise<{
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
    getProjectMedia(projectId: string, userId: string): Promise<{
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
    deleteMediaFile(mediaId: string, userId: string): Promise<{
        success: boolean;
    }>;
    initiateGoogleDriveAuth(userId: string): Promise<{
        authUrl: string;
    }>;
    importFromGoogleDrive(userId: string, driveFileId: string, projectId: string): Promise<void>;
    searchStockFootage(query: string, page?: number, perPage?: number): Promise<{
        results: any[];
        page: number;
        perPage: number;
        total: number;
    }>;
    generateAiBroll(userId: string, projectId: string, prompt: string): Promise<{
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
    createBrollCategory(name: string, sortOrder?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        sortOrder: number;
    }>;
    createBrollSubcategory(categoryId: string, name: string, sortOrder?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        sortOrder: number;
        categoryId: string;
    }>;
    createBrollItem(subcategoryId: string, data: {
        name: string;
        description?: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl?: string;
        type?: string;
        isPremium?: boolean;
        duration?: number;
    }, sortOrder?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        s3Key: string;
        description: string | null;
        duration: number | null;
        thumbnailUrl: string | null;
        type: string;
        s3Url: string;
        isActive: boolean;
        sortOrder: number;
        subcategoryId: string;
        isPremium: boolean;
    }>;
}
