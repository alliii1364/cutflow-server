import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
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

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  }

  async getNotificationPreferences(userId: string) {
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Create default preferences
      return this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  }

  async updateNotificationPreferences(userId: string, data: any) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // Internal methods for creating notifications
  async createNotification(
    userId: string,
    type: 'EMAIL' | 'IN_APP' | 'BOTH',
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any,
  ) {
    // Create in-app notification
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

    // Send email notification
    if (type === 'EMAIL' || type === 'BOTH') {
      await this.sendEmail(userId, title, message, actionUrl);
    }
  }

  private async sendEmail(userId: string, subject: string, message: string, actionUrl?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) return;

    const fromEmail = this.configService.get('SENDGRID_FROM_EMAIL') || 'noreply@cutflow.app';

    try {
      await sgMail.send({
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
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Trigger methods for specific events
  async notifyExportComplete(userId: string, exportId: string, projectTitle: string) {
    const prefs = await this.getNotificationPreferences(userId);

    if (prefs.emailOnExportComplete) {
      await this.createNotification(
        userId,
        'EMAIL',
        'Your video export is ready!',
        `Your video "${projectTitle}" has been successfully exported and is ready for download.`,
        `/exports/${exportId}`,
      );
    }
  }

  async notifySubscriptionChange(userId: string, planName: string, status: string) {
    const prefs = await this.getNotificationPreferences(userId);

    if (prefs.emailOnSubscriptionChange) {
      await this.createNotification(
        userId,
        'EMAIL',
        'Subscription Update',
        `Your subscription to ${planName} is now ${status}.`,
        '/billing',
      );
    }
  }
}
