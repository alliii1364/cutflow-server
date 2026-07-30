import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(
    userId: string | undefined,
    event: string,
    category: string,
    metadata?: any,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId,
        event,
        category,
        metadata: metadata || {},
        sessionId,
        ipAddress,
        userAgent,
      },
    });
  }

  async getUserDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [
      totalVideos,
      videosByStatus,
      totalExports,
      recentExports,
      aiFeatureUsage,
      last30DaysActivity,
    ] = await Promise.all([
      this.prisma.videoProject.count({
        where: { userId, isDeleted: false },
      }),
      this.prisma.videoProject.groupBy({
        by: ['status'],
        where: { userId, isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.videoExport.count({
        where: { project: { userId } },
      }),
      this.prisma.videoExport.findMany({
        where: { project: { userId }, status: 'COMPLETED' },
        orderBy: { renderCompletedAt: 'desc' },
        take: 5,
        include: { project: { select: { title: true, thumbnailUrl: true } } },
      }),
      this.prisma.processingJob.groupBy({
        by: ['jobType'],
        where: { project: { userId } },
        _count: { _all: true },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['event'],
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { _all: true },
      }),
    ]);

    return {
      overview: {
        totalVideos,
        totalExports,
        videosByStatus: videosByStatus.reduce((acc, item) => {
          acc[item.status] = item._count._all;
          return acc;
        }, {}),
      },
      recentExports,
      aiFeatureUsage: aiFeatureUsage.reduce((acc, item) => {
        acc[item.jobType] = item._count._all;
        return acc;
      }, {}),
      last30DaysActivity: last30DaysActivity.reduce((acc, item) => {
        acc[item.event] = item._count._all;
        return acc;
      }, {}),
    };
  }

  async getPopularFeatures() {
    const featureUsage = await this.prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      _count: true,
      orderBy: { _count: { event: 'desc' } },
      take: 20,
    }) as any;

    return featureUsage.map((item) => ({
      feature: item.event,
      usageCount: item._count._all,
    }));
  }

  async getAdminPlatformMetrics() {
    const [
      dailyActiveUsers,
      newUsersLast7Days,
      videoCreationsLast7Days,
      exportsLast7Days,
      topUsersByVideos,
      subscriptionDistribution,
    ] = await Promise.all([
      this.prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        _count: { _all: true },
      }).then((results) => results.length),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.videoProject.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.videoExport.count({
        where: {
          status: 'COMPLETED',
          renderCompletedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: {
          videoProjects: { _count: 'desc' },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          _count: { select: { videoProjects: { where: { isDeleted: false } } } },
        },
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    return {
      dailyActiveUsers,
      newUsersLast7Days,
      videoCreationsLast7Days,
      exportsLast7Days,
      topUsers: topUsersByVideos,
      subscriptionDistribution: subscriptionDistribution.reduce((acc, item) => {
        acc[item.status] = item._count._all;
        return acc;
      }, {}),
    };
  }
}
