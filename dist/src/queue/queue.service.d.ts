import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private redisConnection;
    private available;
    private queues;
    private workers;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    getQueue(name: string): Queue | null;
    addJob<T>(queueName: string, jobName: string, data: T, opts?: any): Promise<Job<T> | null>;
    createWorker<T>(queueName: string, processor: (job: Job<T>) => Promise<any>): Worker | null;
    getJobStatus(queueName: string, jobId: string): Promise<{
        id: string;
        name: string;
        data: any;
        state: import("bullmq").JobState | "unknown";
        progress: import("bullmq").JobProgress;
        failedReason: string;
        returnvalue: any;
        timestamp: number;
        processedOn: number;
        finishedOn: number;
    }>;
}
