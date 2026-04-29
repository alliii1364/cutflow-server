import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<any>;
    uploadAvatar(userId: string, file: any): Promise<any>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getUsageStats(userId: string): Promise<{
        subscription: {
            plan: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                sortOrder: number;
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
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            planId: string;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            videoCount: number;
            trialEndsAt: Date | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            canceledAt: Date | null;
            cancelAtPeriodEnd: boolean;
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
                title: string;
                thumbnailUrl: string;
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
        })[];
    }>;
}
