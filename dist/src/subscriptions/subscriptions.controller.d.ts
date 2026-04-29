import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getPlans(): Promise<{
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
    }[]>;
    getMySubscription(userId: string): Promise<{
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
    }>;
    createCheckout(userId: string, planId: string): Promise<{
        url: any;
        sessionId: any;
    }>;
    createBillingPortal(userId: string): Promise<{
        url: any;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
}
