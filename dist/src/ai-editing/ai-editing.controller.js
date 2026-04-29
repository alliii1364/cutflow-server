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
exports.AiEditingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_editing_service_1 = require("./ai-editing.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AiEditingController = class AiEditingController {
    constructor(aiEditingService) {
        this.aiEditingService = aiEditingService;
    }
    async removeSilence(userId, projectId, body) {
        return this.aiEditingService.removeSilence(userId, projectId, body);
    }
    async resizeVideo(userId, projectId, body) {
        return this.aiEditingService.resizeVideo(userId, projectId, body.aspectRatio);
    }
    async applyFilters(userId, projectId, body) {
        return this.aiEditingService.applyFilters(userId, projectId, body);
    }
    async addZoomEffects(userId, projectId, body) {
        return this.aiEditingService.addZoomEffects(userId, projectId, body.timestamps);
    }
    async getJobStatus(userId, jobId) {
        return this.aiEditingService.getJobStatus(jobId, userId);
    }
    async getProjectJobs(userId, projectId) {
        return this.aiEditingService.getProjectJobs(projectId, userId);
    }
};
exports.AiEditingController = AiEditingController;
__decorate([
    (0, common_1.Post)(':projectId/silence-removal'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove silence from video' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "removeSilence", null);
__decorate([
    (0, common_1.Post)(':projectId/resize'),
    (0, swagger_1.ApiOperation)({ summary: 'Resize video to target aspect ratio' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "resizeVideo", null);
__decorate([
    (0, common_1.Post)(':projectId/filters'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply filters to video' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "applyFilters", null);
__decorate([
    (0, common_1.Post)(':projectId/zoom-effects'),
    (0, swagger_1.ApiOperation)({ summary: 'Add zoom hook effects' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "addZoomEffects", null);
__decorate([
    (0, common_1.Get)('job/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('project/:projectId/jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all jobs for a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AiEditingController.prototype, "getProjectJobs", null);
exports.AiEditingController = AiEditingController = __decorate([
    (0, swagger_1.ApiTags)('AI Editing'),
    (0, common_1.Controller)('ai-editing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ai_editing_service_1.AiEditingService])
], AiEditingController);
//# sourceMappingURL=ai-editing.controller.js.map