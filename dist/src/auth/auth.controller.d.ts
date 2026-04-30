import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    logout(userId: string, dto: RefreshTokenDto): Promise<{
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    googleAuth(): void;
    googleAuthCallback(req: Request, res: Response): Promise<void>;
    me(userId: string): Promise<{
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
        };
    }>;
}
