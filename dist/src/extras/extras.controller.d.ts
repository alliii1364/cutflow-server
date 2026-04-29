import { ExtrasService } from './extras.service';
export declare class ExtrasController {
    private extrasService;
    constructor(extrasService: ExtrasService);
    getBrandKit(userId: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateBrandKit(userId: string, body: any): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
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
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        secret: string;
        events: string[];
        isActive: boolean;
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
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        secret: string;
        events: string[];
        isActive: boolean;
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
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        secret: string;
        events: string[];
        isActive: boolean;
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
        referrerId: string;
        referredId: string;
        referralCode: string;
        bonusCreditsGranted: boolean;
    }>;
    applyReferralCode(userId: string, body: {
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
