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
exports.ExtrasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const extras_service_1 = require("./extras.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ExtrasController = class ExtrasController {
    constructor(extrasService) {
        this.extrasService = extrasService;
    }
    async getBrandKit(userId) {
        return this.extrasService.getBrandKit(userId);
    }
    async updateBrandKit(userId, body) {
        return this.extrasService.updateBrandKit(userId, body);
    }
    async generateThumbnail(userId, projectId, body) {
        return this.extrasService.generateThumbnail(userId, projectId, body);
    }
    async saveVersion(userId, projectId, body) {
        return this.extrasService.saveVersion(userId, projectId, body.description);
    }
    async getVersions(userId, projectId) {
        return this.extrasService.getVersions(userId, projectId);
    }
    async restoreVersion(userId, projectId, versionId) {
        return this.extrasService.restoreVersion(userId, projectId, versionId);
    }
    async createWebhook(userId, body) {
        return this.extrasService.createWebhook(userId, body.url, body.events);
    }
    async getWebhooks(userId) {
        return this.extrasService.getWebhooks(userId);
    }
    async updateWebhook(userId, webhookId, body) {
        return this.extrasService.updateWebhook(userId, webhookId, body);
    }
    async deleteWebhook(userId, webhookId) {
        return this.extrasService.deleteWebhook(userId, webhookId);
    }
    async generateSeoMetadata(userId, projectId) {
        return this.extrasService.generateSeoMetadata(userId, projectId);
    }
    async getReferralCode(userId) {
        return this.extrasService.getReferralCode(userId);
    }
    async applyReferralCode(userId, body) {
        return this.extrasService.applyReferralCode(userId, body.code);
    }
};
exports.ExtrasController = ExtrasController;
__decorate([
    (0, common_1.Get)('brand-kit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get brand kit' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "getBrandKit", null);
__decorate([
    (0, common_1.Post)('brand-kit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update brand kit' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "updateBrandKit", null);
__decorate([
    (0, common_1.Post)(':projectId/thumbnail'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI thumbnail' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "generateThumbnail", null);
__decorate([
    (0, common_1.Post)(':projectId/version'),
    (0, swagger_1.ApiOperation)({ summary: 'Save project version' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "saveVersion", null);
__decorate([
    (0, common_1.Get)(':projectId/versions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project versions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)(':projectId/restore/:versionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore project version' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Post)('webhooks'),
    (0, swagger_1.ApiOperation)({ summary: 'Create webhook' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "createWebhook", null);
__decorate([
    (0, common_1.Get)('webhooks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get webhooks' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "getWebhooks", null);
__decorate([
    (0, common_1.Patch)('webhooks/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update webhook' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "updateWebhook", null);
__decorate([
    (0, common_1.Delete)('webhooks/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete webhook' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "deleteWebhook", null);
__decorate([
    (0, common_1.Get)(':projectId/seo'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate SEO metadata' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "generateSeoMetadata", null);
__decorate([
    (0, common_1.Get)('referral/code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral code' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "getReferralCode", null);
__decorate([
    (0, common_1.Post)('referral/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply referral code' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExtrasController.prototype, "applyReferralCode", null);
exports.ExtrasController = ExtrasController = __decorate([
    (0, swagger_1.ApiTags)('Extras'),
    (0, common_1.Controller)('extras'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [extras_service_1.ExtrasService])
], ExtrasController);
//# sourceMappingURL=extras.controller.js.map