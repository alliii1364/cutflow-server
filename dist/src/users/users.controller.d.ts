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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.JobStatus;
            s3Key: string | null;
            s3Url: string | null;
            duration: number | null;
            progress: number;
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
