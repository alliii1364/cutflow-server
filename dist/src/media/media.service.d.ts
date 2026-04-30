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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        s3Key: string;
        s3Url: string;
        type: import(".prisma/client").$Enums.MediaType;
        duration: number | null;
        size: number;
        projectId: string;
        width: number | null;
        height: number | null;
        timelinePosition: number | null;
        originalName: string;
        mimeType: string;
        isPrimary: boolean;
    }>;
    getProjectMedia(projectId: string, userId: string): Promise<{
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        createdAt: Date;
        s3Key: string;
        s3Url: string;
        type: import(".prisma/client").$Enums.MediaType;
        duration: number | null;
        size: number;
        projectId: string;
        width: number | null;
        height: number | null;
        timelinePosition: number | null;
        originalName: string;
        mimeType: string;
        isPrimary: boolean;
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
    getBrollLibrary(q?: string): Promise<{
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
                    tags: string[];
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
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createBrollSubcategory(categoryId: string, name: string, sortOrder?: number): Promise<{
        id: string;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        tags?: string[];
    }, sortOrder?: number): Promise<{
        id: string;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        s3Key: string;
        subcategoryId: string;
        description: string | null;
        s3Url: string;
        thumbnailUrl: string | null;
        type: string;
        isPremium: boolean;
        duration: number | null;
        tags: string[];
    }>;
}
