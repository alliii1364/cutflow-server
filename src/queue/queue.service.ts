import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private redisConnection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redisConnection = new Redis(this.configService.get('REDIS_URL') || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
  }

  onModuleDestroy() {
    this.redisConnection.disconnect();
    this.queues.forEach((queue) => queue.close());
    this.workers.forEach((worker) => worker.close());
  }

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.redisConnection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name)!;
  }

  addJob<T>(queueName: string, jobName: string, data: T, opts?: any): Promise<Job<T>> {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  createWorker<T>(queueName: string, processor: (job: Job<T>) => Promise<any>): Worker {
    const worker = new Worker<T>(queueName, processor, {
      connection: this.redisConnection,
      concurrency: 2,
    });
    this.workers.set(queueName, worker);
    return worker;
  }

  async getJobStatus(queueName: string, jobId: string) {
    const queue = this.getQueue(queueName);
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
