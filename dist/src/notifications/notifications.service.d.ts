import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    private configService;
    private readonly logger;
    private sgReady;
    private fromEmail;
    constructor(prisma: PrismaService, configService: ConfigService);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            metadata: import("@prisma/client/runtime/library").JsonValue;
            id: string;
            type: import(".prisma/client").$Enums.NotificationType;
            createdAt: Date;
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
        metadata: import("@prisma/client/runtime/library").JsonValue;
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
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
    sendOtpEmail(toEmail: string, otp: string, purpose: 'signup' | 'password-reset'): Promise<void>;
    notifyExportComplete(userId: string, exportId: string, projectTitle: string): Promise<void>;
    notifySubscriptionChange(userId: string, planName: string, status: string): Promise<void>;
}
