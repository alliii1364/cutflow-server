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
exports.MusicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const music_service_1 = require("./music.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let MusicController = class MusicController {
    constructor(musicService) {
        this.musicService = musicService;
    }
    async generateMusic(userId, projectId, body) {
        return this.musicService.generateMusic(userId, projectId, body);
    }
    async detectMoodAndMatch(userId, projectId) {
        return this.musicService.detectMoodAndMatchMusic(userId, projectId);
    }
    async getBeatSyncTimestamps(userId, projectId) {
        return this.musicService.getBeatSyncTimestamps(projectId, userId);
    }
    async assignMusic(userId, projectId, body) {
        return this.musicService.assignMusicToProject(userId, projectId, body.musicTrackId);
    }
    async getProjectMusic(userId, projectId) {
        return this.musicService.getProjectMusic(userId, projectId);
    }
};
exports.MusicController = MusicController;
__decorate([
    (0, common_1.Post)(':projectId/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI music' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "generateMusic", null);
__decorate([
    (0, common_1.Post)(':projectId/mood-match'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-detect mood and match music' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "detectMoodAndMatch", null);
__decorate([
    (0, common_1.Get)(':projectId/beat-sync'),
    (0, swagger_1.ApiOperation)({ summary: 'Get beat sync timestamps' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "getBeatSyncTimestamps", null);
__decorate([
    (0, common_1.Post)(':projectId/assign'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign music track to project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "assignMusic", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assigned music for project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MusicController.prototype, "getProjectMusic", null);
exports.MusicController = MusicController = __decorate([
    (0, swagger_1.ApiTags)('Music'),
    (0, common_1.Controller)('music'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [music_service_1.MusicService])
], MusicController);
//# sourceMappingURL=music.controller.js.map