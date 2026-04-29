"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitTestingModule = void 0;
const common_1 = require("@nestjs/common");
const split_testing_service_1 = require("./split-testing.service");
const split_testing_controller_1 = require("./split-testing.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
let SplitTestingModule = class SplitTestingModule {
};
exports.SplitTestingModule = SplitTestingModule;
exports.SplitTestingModule = SplitTestingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_module_1.QueueModule],
        providers: [split_testing_service_1.SplitTestingService],
        controllers: [split_testing_controller_1.SplitTestingController],
        exports: [split_testing_service_1.SplitTestingService],
    })
], SplitTestingModule);
//# sourceMappingURL=split-testing.module.js.map