"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiEditingModule = void 0;
const common_1 = require("@nestjs/common");
const ai_editing_service_1 = require("./ai-editing.service");
const ai_editing_controller_1 = require("./ai-editing.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const videos_module_1 = require("../videos/videos.module");
let AiEditingModule = class AiEditingModule {
};
exports.AiEditingModule = AiEditingModule;
exports.AiEditingModule = AiEditingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_module_1.QueueModule, videos_module_1.VideosModule],
        providers: [ai_editing_service_1.AiEditingService],
        controllers: [ai_editing_controller_1.AiEditingController],
        exports: [ai_editing_service_1.AiEditingService],
    })
], AiEditingModule);
//# sourceMappingURL=ai-editing.module.js.map