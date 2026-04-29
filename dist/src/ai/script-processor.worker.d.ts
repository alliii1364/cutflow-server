import { OnModuleInit } from '@nestjs/common';
import { ScriptService } from './services/script.service';
import { QueueService } from '../queue/queue.service';
export declare class ScriptProcessorWorker implements OnModuleInit {
    private queue;
    private scriptService;
    private readonly logger;
    constructor(queue: QueueService, scriptService: ScriptService);
    onModuleInit(): void;
    private processScriptJob;
}
