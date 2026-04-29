import { SplitTestingService } from './split-testing.service';
export declare class SplitTestingController {
    private splitTestingService;
    constructor(splitTestingService: SplitTestingService);
    createSplitTest(userId: string, projectId: string, body: {
        testHooks?: boolean;
        testCaptions?: boolean;
        testMusic?: boolean;
        testVoice?: boolean;
        variantCount?: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        projectId: string;
        variants: import("@prisma/client/runtime/library").JsonValue;
        totalVariants: number;
        exportedCount: number;
    }>;
    getVariants(userId: string, sessionId: string): Promise<{
        session: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.JobStatus;
            projectId: string;
            variants: import("@prisma/client/runtime/library").JsonValue;
            totalVariants: number;
            exportedCount: number;
        };
        variants: import("@prisma/client/runtime/library").JsonValue;
    }>;
    exportAllVariants(userId: string, sessionId: string): Promise<{
        sessionId: string;
        status: string;
        message: string;
    }>;
    getExportStatus(userId: string, sessionId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        projectId: string;
        variants: import("@prisma/client/runtime/library").JsonValue;
        totalVariants: number;
        exportedCount: number;
    }>;
}
