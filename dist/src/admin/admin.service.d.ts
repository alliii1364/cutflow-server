import { PrismaService } from '../prisma/prisma.service';
import { UserRole, Prisma } from '@prisma/client';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsers(page?: number, limit?: number, search?: string): Promise<{
        data: {
            videoCount: number;
            _count: any;
            subscription: {
                plan: {
                    id: string;
                    name: string;
                    sortOrder: number;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    tier: import(".prisma/client").$Enums.PlanTier;
                    stripePriceId: string | null;
                    priceMonthly: Prisma.Decimal;
                    priceYearly: Prisma.Decimal;
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
                    features: Prisma.JsonValue;
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
    updateUser(userId: string, data: {
        role?: UserRole;
        isActive?: boolean;
        planId?: string;
    }): Promise<{
        subscription: {
            plan: {
                id: string;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tier: import(".prisma/client").$Enums.PlanTier;
                stripePriceId: string | null;
                priceMonthly: Prisma.Decimal;
                priceYearly: Prisma.Decimal;
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
                features: Prisma.JsonValue;
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
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            plan: {
                id: string;
                name: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tier: import(".prisma/client").$Enums.PlanTier;
                stripePriceId: string | null;
                priceMonthly: Prisma.Decimal;
                priceYearly: Prisma.Decimal;
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
                features: Prisma.JsonValue;
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
    createTemplate(data: Prisma.TemplateCreateInput): Promise<{
        id: string;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string | null;
        thumbnailUrl: string | null;
        tags: string[];
        tier: import(".prisma/client").$Enums.TemplateTier;
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: Prisma.JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    updateTemplate(templateId: string, data: Prisma.TemplateUpdateInput): Promise<{
        id: string;
        name: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string | null;
        thumbnailUrl: string | null;
        tags: string[];
        tier: import(".prisma/client").$Enums.TemplateTier;
        style: string | null;
        estimatedDuration: number | null;
        previewUrl: string | null;
        config: Prisma.JsonValue;
        aspectRatios: string[];
        industry: string | null;
    }>;
    deleteTemplate(templateId: string): Promise<{
        success: boolean;
    }>;
    createAsset(data: Prisma.CreativeAssetCreateInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        metadata: Prisma.JsonValue;
        tags: string[];
        tier: import(".prisma/client").$Enums.TemplateTier;
    }>;
    updateAsset(assetId: string, data: Prisma.CreativeAssetUpdateInput): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        s3Key: string;
        s3Url: string;
        thumbnailUrl: string | null;
        type: import(".prisma/client").$Enums.AssetType;
        metadata: Prisma.JsonValue;
        tags: string[];
        tier: import(".prisma/client").$Enums.TemplateTier;
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
    createFeatureFlag(data: Prisma.FeatureFlagCreateInput): Promise<{
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
    updateFeatureFlag(flagId: string, data: Prisma.FeatureFlagUpdateInput): Promise<{
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
