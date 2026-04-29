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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitTestingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const split_testing_service_1 = require("./split-testing.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let SplitTestingController = class SplitTestingController {
    constructor(splitTestingService) {
        this.splitTestingService = splitTestingService;
    }
    async createSplitTest(userId, projectId, body) {
        return this.splitTestingService.createSplitTest(userId, projectId, body);
    }
    async getVariants(userId, sessionId) {
        return this.splitTestingService.getVariants(userId, sessionId);
    }
    async exportAllVariants(userId, sessionId) {
        return this.splitTestingService.exportAllVariants(userId, sessionId);
    }
    async getExportStatus(userId, sessionId) {
        return this.splitTestingService.getExportStatus(userId, sessionId);
    }
};
exports.SplitTestingController = SplitTestingController;
__decorate([
    (0, common_1.Post)(':projectId/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create split test variants' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SplitTestingController.prototype, "createSplitTest", null);
__decorate([
    (0, common_1.Get)(':sessionId/variants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all variants for a session' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SplitTestingController.prototype, "getVariants", null);
__decorate([
    (0, common_1.Post)(':sessionId/export-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Export all variants' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SplitTestingController.prototype, "exportAllVariants", null);
__decorate([
    (0, common_1.Get)(':sessionId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get export status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SplitTestingController.prototype, "getExportStatus", null);
exports.SplitTestingController = SplitTestingController = __decorate([
    (0, swagger_1.ApiTags)('Split Testing'),
    (0, common_1.Controller)('split-testing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [split_testing_service_1.SplitTestingService])
], SplitTestingController);
//# sourceMappingURL=split-testing.controller.js.map