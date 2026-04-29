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
var ScriptProcessorWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptProcessorWorker = void 0;
const common_1 = require("@nestjs/common");
const script_service_1 = require("./services/script.service");
const queue_service_1 = require("../queue/queue.service");
let ScriptProcessorWorker = ScriptProcessorWorker_1 = class ScriptProcessorWorker {
    constructor(queue, scriptService) {
        this.queue = queue;
        this.scriptService = scriptService;
        this.logger = new common_1.Logger(ScriptProcessorWorker_1.name);
    }
    onModuleInit() {
        this.queue.createWorker('scripts', async (job) => {
            await this.processScriptJob(job);
        });
        this.logger.log('Script processor worker initialized');
    }
    async processScriptJob(job) {
        const { projectId, request } = job.data;
        this.logger.log(`Processing script job ${job.id} for project ${projectId}`);
        try {
            await job.updateProgress(10);
            await this.scriptService.processScriptGeneration({
                projectId,
                request,
            });
            await job.updateProgress(100);
            this.logger.log(`Script job ${job.id} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Script job ${job.id} failed:`, error);
            throw error;
        }
    }
};
exports.ScriptProcessorWorker = ScriptProcessorWorker;
exports.ScriptProcessorWorker = ScriptProcessorWorker = ScriptProcessorWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        script_service_1.ScriptService])
], ScriptProcessorWorker);
//# sourceMappingURL=script-processor.worker.js.map