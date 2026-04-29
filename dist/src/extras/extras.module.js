"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtrasModule = void 0;
const common_1 = require("@nestjs/common");
const extras_service_1 = require("./extras.service");
const extras_controller_1 = require("./extras.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const storage_module_1 = require("../storage/storage.module");
const config_1 = require("@nestjs/config");
let ExtrasModule = class ExtrasModule {
};
exports.ExtrasModule = ExtrasModule;
exports.ExtrasModule = ExtrasModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_module_1.QueueModule, storage_module_1.StorageModule, config_1.ConfigModule],
        providers: [extras_service_1.ExtrasService],
        controllers: [extras_controller_1.ExtrasController],
        exports: [extras_service_1.ExtrasService],
    })
], ExtrasModule);
//# sourceMappingURL=extras.module.js.map