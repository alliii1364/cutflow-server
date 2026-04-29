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
exports.CaptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const captions_service_1 = require("./captions.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let CaptionsController = class CaptionsController {
    constructor(captionsService) {
        this.captionsService = captionsService;
    }
    async generateCaptions(userId, projectId, body) {
        return this.captionsService.generateCaptions(userId, projectId, body.language || 'en');
    }
    async getCaptions(userId, projectId) {
        return this.captionsService.getCaptions(userId, projectId);
    }
    async updateCaptions(userId, projectId, body) {
        return this.captionsService.updateCaptions(userId, projectId, body);
    }
    async extractKeywords(userId, projectId) {
        return this.captionsService.extractKeywords(userId, projectId);
    }
    async applyAnimatedStyle(userId, projectId, body) {
        return this.captionsService.applyAnimatedStyle(userId, projectId, body.style);
    }
};
exports.CaptionsController = CaptionsController;
__decorate([
    (0, common_1.Post)(':projectId/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate captions using Whisper' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CaptionsController.prototype, "generateCaptions", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get captions for project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CaptionsController.prototype, "getCaptions", null);
__decorate([
    (0, common_1.Patch)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update captions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CaptionsController.prototype, "updateCaptions", null);
__decorate([
    (0, common_1.Post)(':projectId/keywords'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract keywords from captions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CaptionsController.prototype, "extractKeywords", null);
__decorate([
    (0, common_1.Post)(':projectId/animate'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply animated caption style' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CaptionsController.prototype, "applyAnimatedStyle", null);
exports.CaptionsController = CaptionsController = __decorate([
    (0, swagger_1.ApiTags)('Captions'),
    (0, common_1.Controller)('captions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [captions_service_1.CaptionsService])
], CaptionsController);
//# sourceMappingURL=captions.controller.js.map