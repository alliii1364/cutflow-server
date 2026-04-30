import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private templatesService;
    constructor(templatesService: TemplatesService);
    getTemplates(category?: string, platform?: string, industry?: string, style?: string, tier?: string, page?: number, limit?: number): Promise<{
        data: {
            tags: string[];
            name: string;
            id: string;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            thumbnailUrl: string | null;
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
        tags: string[];
        name: string;
        id: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string | null;
        thumbnailUrl: string | null;
        tier: import(".prisma/client").$Enums.TemplateTier;
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    applyTemplate(userId: string, templateId: string, projectId: string, body: {
        customConfig?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        templateId: string;
        appliedConfig: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getAssets(type?: string, category?: string, tier?: string, page?: number, limit?: number): Promise<{
        data: {
            metadata: import("@prisma/client/runtime/library").JsonValue;
            tags: string[];
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            s3Key: string;
            s3Url: string;
            thumbnailUrl: string | null;
            type: import(".prisma/client").$Enums.AssetType;
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
        tags: string[];
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        tier: import(".prisma/client").$Enums.TemplateTier;
    }>;
    saveUserTemplate(userId: string, body: {
        templateId: string;
        customName?: string;
        customConfig?: any;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        templateId: string;
        customName: string | null;
        customConfig: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getUserTemplates(userId: string): Promise<({
        template: {
            tags: string[];
            name: string;
            id: string;
            sortOrder: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string | null;
            thumbnailUrl: string | null;
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
