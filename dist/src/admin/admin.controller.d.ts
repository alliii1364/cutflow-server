import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        data: {
            videoCount: number;
            _count: any;
            subscription: {
                plan: {
                    id: string;
                    name: string;
                    tier: import(".prisma/client").$Enums.PlanTier;
                    stripePriceId: string | null;
                    priceMonthly: import("@prisma/client/runtime/library").Decimal;
                    priceYearly: import("@prisma/client/runtime/library").Decimal;
                    videoLimit: number;
                    maxVideoDuration: number;
                    maxStorageGb: number;
                    includesAiEditing: boolean;
                    includesAiCaptions: boolean;
                    includesAiVoice: boolean;
                    includesAiAvatar: boolean;
                    includesAiMusic: boolean;
                    includes4K: boolean;
                    includesBrandKit: boolean;
                    includesTeamWorkspaces: boolean;
                    features: import("@prisma/client/runtime/library").JsonValue;
                    isActive: boolean;
                    sortOrder: number;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                stripeCustomerId: string | null;
                stripeSubscriptionId: string | null;
                status: import(".prisma/client").$Enums.SubscriptionStatus;
                videoCount: number;
                trialEndsAt: Date | null;
                currentPeriodStart: Date | null;
                currentPeriodEnd: Date | null;
                canceledAt: Date | null;
                cancelAtPeriodEnd: boolean;
                planId: string;
                userId: string;
            };
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            googleId: string | null;
            passwordHash: string | null;
            firstName: string | null;
            lastName: string | null;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            lastLoginAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUser(userId: string, body: {
        role?: UserRole;
        isActive?: boolean;
        planId?: string;
    }): Promise<{
        subscription: {
            plan: {
                id: string;
                name: string;
                tier: import(".prisma/client").$Enums.PlanTier;
                stripePriceId: string | null;
                priceMonthly: import("@prisma/client/runtime/library").Decimal;
                priceYearly: import("@prisma/client/runtime/library").Decimal;
                videoLimit: number;
                maxVideoDuration: number;
                maxStorageGb: number;
                includesAiEditing: boolean;
                includesAiCaptions: boolean;
                includesAiVoice: boolean;
                includesAiAvatar: boolean;
                includesAiMusic: boolean;
                includes4K: boolean;
                includesBrandKit: boolean;
                includesTeamWorkspaces: boolean;
                features: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            videoCount: number;
            trialEndsAt: Date | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            canceledAt: Date | null;
            cancelAtPeriodEnd: boolean;
            planId: string;
            userId: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string | null;
        passwordHash: string | null;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        lastLoginAt: Date | null;
    }>;
    getAllSubscriptions(page?: number, limit?: number): Promise<{
        data: ({
            plan: {
                id: string;
                name: string;
                tier: import(".prisma/client").$Enums.PlanTier;
                stripePriceId: string | null;
                priceMonthly: import("@prisma/client/runtime/library").Decimal;
                priceYearly: import("@prisma/client/runtime/library").Decimal;
                videoLimit: number;
                maxVideoDuration: number;
                maxStorageGb: number;
                includesAiEditing: boolean;
                includesAiCaptions: boolean;
                includesAiVoice: boolean;
                includesAiAvatar: boolean;
                includesAiMusic: boolean;
                includes4K: boolean;
                includesBrandKit: boolean;
                includesTeamWorkspaces: boolean;
                features: import("@prisma/client/runtime/library").JsonValue;
                isActive: boolean;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
            };
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            videoCount: number;
            trialEndsAt: Date | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            canceledAt: Date | null;
            cancelAtPeriodEnd: boolean;
            planId: string;
            userId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createTemplate(body: any): Promise<{
        id: string;
        name: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string | null;
        thumbnailUrl: string | null;
        tags: string[];
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    updateTemplate(templateId: string, body: any): Promise<{
        id: string;
        name: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
        isActive: boolean;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string | null;
        thumbnailUrl: string | null;
        tags: string[];
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: import("@prisma/client/runtime/library").JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    deleteTemplate(templateId: string): Promise<{
        success: boolean;
    }>;
    createAsset(body: any): Promise<{
        id: string;
        name: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: string[];
    }>;
    updateAsset(assetId: string, body: any): Promise<{
        id: string;
        name: string;
        tier: import(".prisma/client").$Enums.TemplateTier;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        tags: string[];
    }>;
    getFeatureFlags(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
        targetPercent: number | null;
        allowedUserIds: string[];
    }[]>;
    createFeatureFlag(body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
        targetPercent: number | null;
        allowedUserIds: string[];
    }>;
    updateFeatureFlag(flagId: string, body: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
        targetPercent: number | null;
        allowedUserIds: string[];
    }>;
    getPlatformOverview(): Promise<{
        users: {
            total: number;
            active24h: number;
        };
        videos: {
            total: number;
        };
        exports: {
            total: number;
        };
        subscriptions: {
            active: number;
        };
    }>;
}
