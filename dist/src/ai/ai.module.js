"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const caption_service_1 = require("./services/caption.service");
const caption_processor_worker_1 = require("./caption-processor.worker");
const script_service_1 = require("./services/script.service");
const script_processor_worker_1 = require("./script-processor.worker");
const ai_controller_1 = require("./controllers/ai.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const storage_module_1 = require("../storage/storage.module");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_module_1.QueueModule, storage_module_1.StorageModule],
        providers: [
            caption_service_1.CaptionService,
            caption_processor_worker_1.CaptionProcessorWorker,
            script_service_1.ScriptService,
            script_processor_worker_1.ScriptProcessorWorker,
        ],
        controllers: [ai_controller_1.AIController],
        exports: [caption_service_1.CaptionService, script_service_1.ScriptService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map