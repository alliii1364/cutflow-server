import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redisConnection: Redis | null = null;
  private available = false;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
    try {
      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy: () => null,
      });
      await client.connect();
      this.redisConnection = client;
      this.available = true;
      this.logger.log('Queue connected to Redis');
    } catch (err: any) {
      this.logger.warn(`Redis unavailable — job queuing disabled: ${err.message}`);
    }
  }

  onModuleDestroy() {
    this.queues.forEach((queue) => queue.close());
    this.workers.forEach((worker) => worker.close());
    this.redisConnection?.disconnect();
  }

  getQueue(name: string): Queue | null {
    if (!this.available || !this.redisConnection) return null;
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  addJob<T>(queueName: string, jobName: string, data: T, opts?: any): Promise<Job<T> | null> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      this.logger.warn(`Skipping job "${jobName}" — Redis unavailable`);
      return Promise.resolve(null);
    }
    return queue.add(jobName, data, opts);
  }

  createWorker<T>(queueName: string, processor: (job: Job<T>) => Promise<any>): Worker | null {
    if (!this.available || !this.redisConnection) return null;
    const worker = new Worker<T>(queueName, processor, {
      connection: this.redisConnection,
      concurrency: 2,
    });
    this.workers.set(queueName, worker);
    return worker;
  }

  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
    if (!queue) return null;
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }
}
