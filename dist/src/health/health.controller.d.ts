import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        services: {
            database: string;
        };
        error?: undefined;
    } | {
        status: string;
        timestamp: string;
        error: any;
        uptime?: undefined;
        services?: undefined;
    }>;
    ready(): Promise<{
        ready: boolean;
    }>;
}
