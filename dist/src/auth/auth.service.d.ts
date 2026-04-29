import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(email: string, password: string, firstName?: string, lastName?: string): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    login(email: string, password: string): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(userId: string, refreshToken: string): Promise<{
        success: boolean;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyResetOtp(email: string, otp: string): Promise<{
        resetToken: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokens;
    getMe(userId: string): Promise<{
        user: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            subscription: {
                plan: {
                    id: string;
                    name: string;
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
                    isActive: boolean;
                    sortOrder: number;
                    createdAt: Date;
                    updatedAt: Date;
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
        };
    }>;
    private saveRefreshToken;
    private sanitizeUser;
    handleGoogleCallback(user: any): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
}
