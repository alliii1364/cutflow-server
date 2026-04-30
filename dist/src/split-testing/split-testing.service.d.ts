import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class SplitTestingService {
    private prisma;
    private queue;
    constructor(prisma: PrismaService, queue: QueueService);
    createSplitTest(userId: string, projectId: string, options: {
        testHooks?: boolean;
        testCaptions?: boolean;
        testMusic?: boolean;
        testVoice?: boolean;
        variantCount?: number;
    }): Promise<{
        name: string;
        id: string;
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
            name: string;
            id: string;
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
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.JobStatus;
        projectId: string;
        variants: import("@prisma/client/runtime/library").JsonValue;
        totalVariants: number;
        exportedCount: number;
    }>;
}
