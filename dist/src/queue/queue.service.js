"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
let QueueService = QueueService_1 = class QueueService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(QueueService_1.name);
        this.redisConnection = null;
        this.available = false;
        this.queues = new Map();
        this.workers = new Map();
    }
    async onModuleInit() {
        const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
        try {
            const client = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: null,
                enableOfflineQueue: false,
                lazyConnect: true,
                retryStrategy: () => null,
            });
            await client.connect();
            this.redisConnection = client;
            this.available = true;
            this.logger.log('Queue connected to Redis');
        }
        catch (err) {
            this.logger.warn(`Redis unavailable — job queuing disabled: ${err.message}`);
        }
    }
    onModuleDestroy() {
        this.queues.forEach((queue) => queue.close());
        this.workers.forEach((worker) => worker.close());
        this.redisConnection?.disconnect();
    }
    getQueue(name) {
        if (!this.available || !this.redisConnection)
            return null;
        if (!this.queues.has(name)) {
            const queue = new bullmq_1.Queue(name, {
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
        return this.queues.get(name);
    }
    addJob(queueName, jobName, data, opts) {
        const queue = this.getQueue(queueName);
        if (!queue) {
            this.logger.warn(`Skipping job "${jobName}" — Redis unavailable`);
            return Promise.resolve(null);
        }
        return queue.add(jobName, data, opts);
    }
    createWorker(queueName, processor) {
        if (!this.available || !this.redisConnection)
            return null;
        const worker = new bullmq_1.Worker(queueName, processor, {
            connection: this.redisConnection,
            concurrency: 2,
        });
        this.workers.set(queueName, worker);
        return worker;
    }
    async getJobStatus(queueName, jobId) {
        const queue = this.getQueue(queueName);
        if (!queue)
            return null;
        const job = await queue.getJob(jobId);
        if (!job)
            return null;
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
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map