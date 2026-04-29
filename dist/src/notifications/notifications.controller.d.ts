import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.NotificationType;
            metadata: import("@prisma/client/runtime/library").JsonValue;
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
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        title: string;
        message: string;
        isRead: boolean;
        actionUrl: string | null;
        sentAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
    }>;
    getPreferences(userId: string): Promise<{
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
    updatePreferences(userId: string, body: any): Promise<{
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
}
