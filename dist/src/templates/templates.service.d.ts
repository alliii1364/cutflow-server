import { PrismaService } from '../prisma/prisma.service';
export declare class TemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    getTemplates(filters: {
        category?: string;
        platform?: string;
        industry?: string;
        style?: string;
        tier?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            name: string;
            description: string | null;
            thumbnailUrl: string | null;
            tags: string[];
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            tier: import(".prisma/client").$Enums.TemplateTier;
            style: string | null;
            estimatedDuration: number | null;
            previewUrl: string | null;
            config: import("@prisma/client/runtime/library").JsonValue;
            aspectRatios: string[];
            industry: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTemplateById(templateId: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        thumbnailUrl: string | null;
        tags: string[];
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    applyTemplate(userId: string, projectId: string, templateId: string, customConfig?: any): Promise<{
        id: string;
        createdAt: Date;
        templateId: string;
        projectId: string;
        appliedConfig: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getAssets(filters: {
        type?: string;
        category?: string;
        tags?: string[];
        tier?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            metadata: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            name: string;
            s3Key: string;
            s3Url: string;
            thumbnailUrl: string | null;
            type: import(".prisma/client").$Enums.AssetType;
            tags: string[];
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            tier: import(".prisma/client").$Enums.TemplateTier;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAssetById(assetId: string): Promise<{
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        name: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
    }>;
    saveUserTemplate(userId: string, templateId: string, customName?: string, customConfig?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        templateId: string;
        customName: string | null;
        customConfig: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getUserTemplates(userId: string): Promise<({
        template: {
            id: string;
            name: string;
            description: string | null;
            thumbnailUrl: string | null;
            tags: string[];
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            tier: import(".prisma/client").$Enums.TemplateTier;
            style: string | null;
            estimatedDuration: number | null;
            previewUrl: string | null;
            config: import("@prisma/client/runtime/library").JsonValue;
            aspectRatios: string[];
            industry: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        templateId: string;
        customName: string | null;
        customConfig: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    deleteUserTemplate(userId: string, templateId: string): Promise<{
        success: boolean;
    }>;
}
