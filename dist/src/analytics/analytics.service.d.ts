import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    trackEvent(userId: string | undefined, event: string, category: string, metadata?: any, sessionId?: string, ipAddress?: string, userAgent?: string): Promise<{
        event: string;
        id: string;
        createdAt: Date;
        userId: string | null;
        category: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        sessionId: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
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
