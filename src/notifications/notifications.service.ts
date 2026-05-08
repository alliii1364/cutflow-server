import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: Transporter | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const gmailUser = this.configService.get('GMAIL_USER');
    const gmailPass = this.configService.get('GMAIL_APP_PASSWORD');
    if (gmailUser && gmailPass) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,
        auth: { user: gmailUser, pass: gmailPass },
      });
      this.logger.log(`Email transporter ready (${gmailUser})`);
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

  private fromAddress(): string {
    const user = this.configService.get('GMAIL_USER') || 'noreply@cutflow.app';
    return `CutFlow <${user}>`;
  }

  private async sendEmail(userId: string, subject: string, message: string, actionUrl?: string) {
    if (!this.transporter) return;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) return;

    try {
      await this.transporter.sendMail({
        to: user.email,
        from: this.fromAddress(),
        subject,
        text: message,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2>${subject}</h2>
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" style="display:inline-block;padding:12px 24px;background:#0070f3;color:#fff;text-decoration:none;border-radius:4px">View Details</a>` : ''}
          </div>`,
      });
    } catch (error) {
      this.logger.error('Failed to send email:', error);
    }
  }

  async sendOtpEmail(toEmail: string, otp: string, purpose: 'signup' | 'password-reset') {
    if (!this.transporter) {
      this.logger.warn('Email not configured — skipping OTP email');
      return;
    }

    const subject = purpose === 'signup' ? 'Verify your CutFlow account' : 'Your CutFlow password reset code';
    const heading = purpose === 'signup' ? 'Verify your email' : 'Reset your password';
    const body = purpose === 'signup'
      ? 'Use the code below to verify your email address and activate your CutFlow account.'
      : 'Use the code below to reset your CutFlow password. This code expires in 15 minutes.';

    try {
      const info = await this.transporter.sendMail({
        to: toEmail,
        from: this.fromAddress(),
        subject,
        text: `${heading}\n\n${body}\n\nYour code: ${otp}\n\nThis code expires in 15 minutes.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
            <h2 style="margin:0 0 8px;font-size:20px;color:#111">${heading}</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px">${body}</p>
            <div style="text-align:center;margin:24px 0">
              <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;color:#111;background:#f3f4f6;padding:16px 24px;border-radius:8px">${otp}</span>
            </div>
            <p style="margin:24px 0 0;color:#9ca3af;font-size:12px">This code expires in 15 minutes. If you did not request this, you can safely ignore this email.</p>
          </div>`,
      });
      this.logger.log(`OTP email sent to ${toEmail} — messageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${toEmail}:`, error);
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
