"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptionsModule = void 0;
const common_1 = require("@nestjs/common");
const captions_service_1 = require("./captions.service");
const captions_controller_1 = require("./captions.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const config_1 = require("@nestjs/config");
let CaptionsModule = class CaptionsModule {
};
exports.CaptionsModule = CaptionsModule;
exports.CaptionsModule = CaptionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_module_1.QueueModule, config_1.ConfigModule],
        providers: [captions_service_1.CaptionsService],
        controllers: [captions_controller_1.CaptionsController],
        exports: [captions_service_1.CaptionsService],
    })
], CaptionsModule);
//# sourceMappingURL=captions.module.js.map