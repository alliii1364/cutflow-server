import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
export declare class UsersService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: StorageService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
        email?: string;
    }): Promise<any>;
    uploadAvatar(userId: string, file: any): Promise<any>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUsageStats(userId: string): Promise<{
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
        videoQuota: {
            used: number;
            limit: number;
        };
        storage: {
            used: number;
            limit: number;
        };
        totalVideos: number;
        exportedVideos: number;
        recentExports: ({
            project: {
                thumbnailUrl: string;
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
        })[];
    }>;
}
