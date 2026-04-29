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
var CaptionProcessorWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionProcessorWorker = void 0;
const common_1 = require("@nestjs/common");
const caption_service_1 = require("./services/caption.service");
const queue_service_1 = require("../queue/queue.service");
let CaptionProcessorWorker = CaptionProcessorWorker_1 = class CaptionProcessorWorker {
    constructor(queue, captionService) {
        this.queue = queue;
        this.captionService = captionService;
        this.logger = new common_1.Logger(CaptionProcessorWorker_1.name);
    }
    onModuleInit() {
        this.queue.createWorker('captions', async (job) => {
            await this.processCaptionJob(job);
        });
        this.logger.log('Caption processor worker initialized');
    }
    async processCaptionJob(job) {
        const { projectId, videoKey, language, style } = job.data;
        this.logger.log(`Processing caption job ${job.id} for project ${projectId}`);
        try {
            await job.updateProgress(10);
            await this.captionService.processCaptionGeneration({
                projectId,
                videoKey,
                language,
                style,
            });
            await job.updateProgress(100);
            this.logger.log(`Caption job ${job.id} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Caption job ${job.id} failed:`, error);
            throw error;
        }
    }
};
exports.CaptionProcessorWorker = CaptionProcessorWorker;
exports.CaptionProcessorWorker = CaptionProcessorWorker = CaptionProcessorWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        caption_service_1.CaptionService])
], CaptionProcessorWorker);
//# sourceMappingURL=caption-processor.worker.js.map