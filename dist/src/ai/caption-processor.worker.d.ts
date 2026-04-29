import { OnModuleInit } from '@nestjs/common';
import { CaptionService } from './services/caption.service';
import { QueueService } from '../queue/queue.service';
export declare class CaptionProcessorWorker implements OnModuleInit {
    private queue;
    private captionService;
    private readonly logger;
    constructor(queue: QueueService, captionService: CaptionService);
    onModuleInit(): void;
    private processCaptionJob;
}
