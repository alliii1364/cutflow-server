import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private redisConnection;
    private queues;
    private workers;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    getQueue(name: string): Queue;
    addJob<T>(queueName: string, jobName: string, data: T, opts?: any): Promise<Job<T>>;
    createWorker<T>(queueName: string, processor: (job: Job<T>) => Promise<any>): Worker;
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
