import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getUserDashboard(userId: string): Promise<{
        overview: {
            totalVideos: number;
            totalExports: number;
            videosByStatus: {};
        };
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
        aiFeatureUsage: {};
        last30DaysActivity: {};
    }>;
    getPopularFeatures(): Promise<any>;
    getAdminPlatformMetrics(): Promise<{
        dailyActiveUsers: number;
        newUsersLast7Days: number;
        videoCreationsLast7Days: number;
        exportsLast7Days: number;
        topUsers: {
            id: string;
            _count: {
                videoProjects: number;
            };
            email: string;
            firstName: string;
            lastName: string;
        }[];
        subscriptionDistribution: {};
    }>;
}
