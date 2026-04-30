import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        subscription: {
            plan: {
                name: string;
                id: string;
                sortOrder: number;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                tier: import(".prisma/client").$Enums.PlanTier;
                stripePriceId: string | null;
                priceMonthly: import("@prisma/client/runtime/library").Decimal;
                priceYearly: import("@prisma/client/runtime/library").Decimal;
                videoLimit: number;
                maxVideoDuration: number;
                maxStorageGb: number;
                includesAiEditing: boolean;
                includesAiCaptions: boolean;
                includesAiVoice: boolean;
                includesAiAvatar: boolean;
                includesAiMusic: boolean;
                includes4K: boolean;
                includesBrandKit: boolean;
                includesTeamWorkspaces: boolean;
                features: import("@prisma/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            stripeCustomerId: string | null;
            stripeSubscriptionId: string | null;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            videoCount: number;
            trialEndsAt: Date | null;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            canceledAt: Date | null;
            cancelAtPeriodEnd: boolean;
            planId: string;
            userId: string;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string | null;
        passwordHash: string | null;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        emailVerified: boolean;
        lastLoginAt: Date | null;
    }>;
}
export {};
