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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
let QueueService = class QueueService {
    constructor(configService) {
        this.configService = configService;
        this.queues = new Map();
        this.workers = new Map();
    }
    onModuleInit() {
        this.redisConnection = new ioredis_1.default(this.configService.get('REDIS_URL') || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
        });
    }
    onModuleDestroy() {
        this.redisConnection.disconnect();
        this.queues.forEach((queue) => queue.close());
        this.workers.forEach((worker) => worker.close());
    }
    getQueue(name) {
        if (!this.queues.has(name)) {
            const queue = new bullmq_1.Queue(name, {
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
        return this.queues.get(name);
    }
    addJob(queueName, jobName, data, opts) {
        const queue = this.getQueue(queueName);
        return queue.add(jobName, data, opts);
    }
    createWorker(queueName, processor) {
        const worker = new bullmq_1.Worker(queueName, processor, {
            connection: this.redisConnection,
            concurrency: 2,
        });
        this.workers.set(queueName, worker);
        return worker;
    }
    async getJobStatus(queueName, jobId) {
        const queue = this.getQueue(queueName);
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
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map