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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const templates_service_1 = require("./templates.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let TemplatesController = class TemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async getTemplates(category, platform, industry, style, tier, page, limit) {
        return this.templatesService.getTemplates({
            category,
            platform,
            industry,
            style,
            tier,
            page,
            limit,
        });
    }
    async getTemplateById(templateId) {
        return this.templatesService.getTemplateById(templateId);
    }
    async applyTemplate(userId, templateId, projectId, body) {
        return this.templatesService.applyTemplate(userId, projectId, templateId, body.customConfig);
    }
    async getAssets(type, category, tier, page, limit) {
        return this.templatesService.getAssets({ type, category, tier, page, limit });
    }
    async getAssetById(assetId) {
        return this.templatesService.getAssetById(assetId);
    }
    async saveUserTemplate(userId, body) {
        return this.templatesService.saveUserTemplate(userId, body.templateId, body.customName, body.customConfig);
    }
    async getUserTemplates(userId) {
        return this.templatesService.getUserTemplates(userId);
    }
    async deleteUserTemplate(userId, templateId) {
        return this.templatesService.deleteUserTemplate(userId, templateId);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List templates' }),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('platform')),
    __param(2, (0, common_1.Query)('industry')),
    __param(3, (0, common_1.Query)('style')),
    __param(4, (0, common_1.Query)('tier')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get template details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplateById", null);
__decorate([
    (0, common_1.Post)(':templateId/apply/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply template to project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('templateId')),
    __param(2, (0, common_1.Param)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "applyTemplate", null);
__decorate([
    (0, common_1.Get)('assets/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List creative assets' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('tier')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getAssetById", null);
__decorate([
    (0, common_1.Post)('user/save'),
    (0, swagger_1.ApiOperation)({ summary: 'Save template to user library' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "saveUserTemplate", null);
__decorate([
    (0, common_1.Get)('user/my-templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user saved templates' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getUserTemplates", null);
__decorate([
    (0, common_1.Delete)('user/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user saved template' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "deleteUserTemplate", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Templates'),
    (0, common_1.Controller)('templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map