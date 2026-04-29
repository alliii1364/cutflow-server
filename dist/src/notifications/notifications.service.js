"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_1 = require("@sendgrid/mail");
let NotificationsService = class NotificationsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('SENDGRID_API_KEY');
        if (apiKey) {
            mail_1.default.setApiKey(apiKey);
        }
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
        ]);
        return {
            data: notifications,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    }
    async getNotificationPreferences(userId) {
        const prefs = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });
        if (!prefs) {
            return this.prisma.notificationPreference.create({
                data: { userId },
            });
        }
        return prefs;
    }
    async updateNotificationPreferences(userId, data) {
        return this.prisma.notificationPreference.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
        });
    }
    async createNotification(userId, type, title, message, actionUrl, metadata) {
        if (type === 'IN_APP' || type === 'BOTH') {
            await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    actionUrl,
                    metadata,
                },
            });
        }
        if (type === 'EMAIL' || type === 'BOTH') {
            await this.sendEmail(userId, title, message, actionUrl);
        }
    }
    async sendEmail(userId, subject, message, actionUrl) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.email)
            return;
        const fromEmail = this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@cutflow.app';
        try {
            await mail_1.default.send({
                to: user.email,
                from: fromEmail,
                subject,
                text: message,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${subject}</h2>
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 4px;">View Details</a>` : ''}
          </div>
        `,
            });
        }
        catch (error) {
            console.error('Failed to send email:', error);
        }
    }
    async notifyExportComplete(userId, exportId, projectTitle) {
        const prefs = await this.getNotificationPreferences(userId);
        if (prefs.emailOnExportComplete) {
            await this.createNotification(userId, 'EMAIL', 'Your video export is ready!', `Your video "${projectTitle}" has been successfully exported and is ready for download.`, `/exports/${exportId}`);
        }
    }
    async notifySubscriptionChange(userId, planName, status) {
        const prefs = await this.getNotificationPreferences(userId);
        if (prefs.emailOnSubscriptionChange) {
            await this.createNotification(userId, 'EMAIL', 'Subscription Update', `Your subscription to ${planName} is now ${status}.`, '/billing');
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map