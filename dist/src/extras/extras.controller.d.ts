import { ExtrasService } from './extras.service';
export declare class ExtrasController {
    private extrasService;
    constructor(extrasService: ExtrasService);
    getBrandKit(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        logoUrl: string | null;
        primaryColor: string | null;
        secondaryColor: string | null;
        accentColor: string | null;
        fontFamily: string | null;
        fontFamilySecondary: string | null;
        defaultCaptionStyle: import("@prisma/client/runtime/library").JsonValue;
        watermarkEnabled: boolean;
        watermarkUrl: string | null;
        watermarkPosition: string;
    }>;
    updateBrandKit(userId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        logoUrl: string | null;
        primaryColor: string | null;
        secondaryColor: string | null;
        accentColor: string | null;
        fontFamily: string | null;
        fontFamilySecondary: string | null;
        defaultCaptionStyle: import("@prisma/client/runtime/library").JsonValue;
        watermarkEnabled: boolean;
        watermarkUrl: string | null;
        watermarkPosition: string;
    }>;
    generateThumbnail(userId: string, projectId: string, body: {
        text?: string;
        frameTime?: number;
        style?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    saveVersion(userId: string, projectId: string, body: {
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        versionNumber: number;
        snapshot: import("@prisma/client/runtime/library").JsonValue;
        changeDescription: string | null;
    }>;
    getVersions(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string;
        versionNumber: number;
        snapshot: import("@prisma/client/runtime/library").JsonValue;
        changeDescription: string | null;
    }[]>;
    restoreVersion(userId: string, projectId: string, versionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createWebhook(userId: string, body: {
        url: string;
        events: string[];
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        secret: string;
        url: string;
        events: string[];
        lastTriggeredAt: Date | null;
        lastStatusCode: number | null;
        failureCount: number;
    }>;
    getWebhooks(userId: string): Promise<({
        _count: {
            deliveries: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        secret: string;
        url: string;
        events: string[];
        lastTriggeredAt: Date | null;
        lastStatusCode: number | null;
        failureCount: number;
    })[]>;
    updateWebhook(userId: string, webhookId: string, body: {
        url?: string;
        events?: string[];
        isActive?: boolean;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        secret: string;
        url: string;
        events: string[];
        lastTriggeredAt: Date | null;
        lastStatusCode: number | null;
        failureCount: number;
    }>;
    deleteWebhook(userId: string, webhookId: string): Promise<{
        success: boolean;
    }>;
    generateSeoMetadata(userId: string, projectId: string): Promise<{
        title: any;
        description: any;
        hashtags: any;
    }>;
    getReferralCode(userId: string): Promise<{
        id: string;
        createdAt: Date;
        referralCode: string;
        bonusCreditsGranted: boolean;
        referredId: string;
        referrerId: string;
    }>;
    applyReferralCode(userId: string, body: {
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
