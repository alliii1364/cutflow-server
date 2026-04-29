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
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const caption_service_1 = require("../services/caption.service");
const script_service_1 = require("../services/script.service");
const caption_dto_1 = require("../dto/caption.dto");
const script_dto_1 = require("../dto/script.dto");
let AIController = class AIController {
    constructor(captionService, scriptService) {
        this.captionService = captionService;
        this.scriptService = scriptService;
    }
    async generateCaptions(userId, projectId, dto) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.captionService.generateCaptions(projectId, dto.language, dto.style);
    }
    async getCaptions(userId, projectId) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.captionService.getCaptions(projectId);
    }
    async updateCaptions(userId, projectId, dto) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.captionService.updateCaptions(projectId, dto);
    }
    async deleteCaptions(userId, projectId) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.captionService.deleteCaptions(projectId);
    }
    async generateScript(userId, projectId, dto) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.scriptService.generateScript(projectId, dto);
    }
    async getScript(userId, projectId) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.scriptService.getScript(projectId);
    }
    async updateScript(userId, projectId, dto) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.scriptService.updateScript(projectId, dto);
    }
    async deleteScript(userId, projectId) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return this.scriptService.deleteScript(projectId);
    }
    async generateHooks(userId, dto) {
        return this.scriptService.generateHooks('temp', dto.sourceContent, dto.count);
    }
    async applyScript(userId, projectId, dto) {
        const project = await this.captionService['prisma'].videoProject.findFirst({
            where: { id: projectId, userId },
        });
        if (!project) {
            throw new Error('Project not found');
        }
        return {
            success: true,
            message: 'Script applied to timeline',
            createClips: dto.createClips,
            generateVoice: dto.generateVoice,
        };
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('captions/generate/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate captions using AI (Whisper)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, caption_dto_1.GenerateCaptionsDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateCaptions", null);
__decorate([
    (0, common_1.Get)('captions/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get captions for a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getCaptions", null);
__decorate([
    (0, common_1.Patch)('captions/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update captions (manual editing)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, caption_dto_1.UpdateCaptionsDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "updateCaptions", null);
__decorate([
    (0, common_1.Delete)('captions/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete captions' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "deleteCaptions", null);
__decorate([
    (0, common_1.Post)('scripts/generate/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate video script using GPT-4' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, script_dto_1.GenerateScriptDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateScript", null);
__decorate([
    (0, common_1.Get)('scripts/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get generated script for a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getScript", null);
__decorate([
    (0, common_1.Patch)('scripts/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update script (manual editing)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, script_dto_1.UpdateScriptDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "updateScript", null);
__decorate([
    (0, common_1.Delete)('scripts/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete script' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "deleteScript", null);
__decorate([
    (0, common_1.Post)('hooks/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate hook variations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, script_dto_1.GenerateHooksDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateHooks", null);
__decorate([
    (0, common_1.Post)('scripts/:projectId/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply script to timeline (create text clips)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, script_dto_1.ApplyScriptDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "applyScript", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [caption_service_1.CaptionService,
        script_service_1.ScriptService])
], AIController);
//# sourceMappingURL=ai.controller.js.map