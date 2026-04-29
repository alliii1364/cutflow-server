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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async trackEvent(userId, event, category, metadata, sessionId, ipAddress, userAgent) {
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
    async getUserDashboard(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const [totalVideos, videosByStatus, totalExports, recentExports, aiFeatureUsage, last30DaysActivity,] = await Promise.all([
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
        });
        return featureUsage.map((item) => ({
            feature: item.event,
            usageCount: item._count._all,
        }));
    }
    async getAdminPlatformMetrics() {
        const [dailyActiveUsers, newUsersLast7Days, videoCreationsLast7Days, exportsLast7Days, topUsersByVideos, subscriptionDistribution,] = await Promise.all([
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map