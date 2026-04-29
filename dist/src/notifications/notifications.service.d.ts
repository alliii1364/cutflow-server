import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            userId: string;
            title: string;
            message: string;
            isRead: boolean;
            actionUrl: string | null;
            sentAt: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        userId: string;
        title: string;
        message: string;
        isRead: boolean;
        actionUrl: string | null;
        sentAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    getNotificationPreferences(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        emailOnExportComplete: boolean;
        emailOnSubscriptionChange: boolean;
        emailOnNewFeatures: boolean;
        emailMarketing: boolean;
        inAppOnExportComplete: boolean;
        inAppOnAiJobComplete: boolean;
    }>;
    updateNotificationPreferences(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        emailOnExportComplete: boolean;
        emailOnSubscriptionChange: boolean;
        emailOnNewFeatures: boolean;
        emailMarketing: boolean;
        inAppOnExportComplete: boolean;
        inAppOnAiJobComplete: boolean;
    }>;
    createNotification(userId: string, type: 'EMAIL' | 'IN_APP' | 'BOTH', title: string, message: string, actionUrl?: string, metadata?: any): Promise<void>;
    private sendEmail;
    notifyExportComplete(userId: string, exportId: string, projectTitle: string): Promise<void>;
    notifySubscriptionChange(userId: string, planName: string, status: string): Promise<void>;
}
