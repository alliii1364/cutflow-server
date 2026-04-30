import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getPlans(): Promise<{
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
    }[]>;
    getMySubscription(userId: string): Promise<{
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
