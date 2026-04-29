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
exports.VoiceAvatarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const voice_avatar_service_1 = require("./voice-avatar.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let VoiceAvatarController = class VoiceAvatarController {
    constructor(voiceAvatarService) {
        this.voiceAvatarService = voiceAvatarService;
    }
    async getAvailableVoices() {
        return this.voiceAvatarService.getAvailableVoices();
    }
    async generateVoiceover(userId, projectId, body) {
        return this.voiceAvatarService.generateVoiceover(userId, projectId, body);
    }
    async getAvatarOptions() {
        return this.voiceAvatarService.getAvatarOptions();
    }
    async generateAvatar(userId, projectId, body) {
        return this.voiceAvatarService.generateAvatar(userId, projectId, body);
    }
    async assignVoice(userId, projectId, body) {
        return this.voiceAvatarService.assignVoiceToProject(userId, projectId, body.voiceTrackId);
    }
};
exports.VoiceAvatarController = VoiceAvatarController;
__decorate([
    (0, common_1.Get)('voices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available AI voices' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoiceAvatarController.prototype, "getAvailableVoices", null);
__decorate([
    (0, common_1.Post)(':projectId/voice'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI voiceover' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VoiceAvatarController.prototype, "generateVoiceover", null);
__decorate([
    (0, common_1.Get)('avatars'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available avatar options' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoiceAvatarController.prototype, "getAvatarOptions", null);
__decorate([
    (0, common_1.Post)(':projectId/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI avatar presenter' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VoiceAvatarController.prototype, "generateAvatar", null);
__decorate([
    (0, common_1.Post)(':projectId/assign-voice'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign voice track to project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], VoiceAvatarController.prototype, "assignVoice", null);
exports.VoiceAvatarController = VoiceAvatarController = __decorate([
    (0, swagger_1.ApiTags)('Voice & Avatar'),
    (0, common_1.Controller)('voice-avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [voice_avatar_service_1.VoiceAvatarService])
], VoiceAvatarController);
//# sourceMappingURL=voice-avatar.controller.js.map