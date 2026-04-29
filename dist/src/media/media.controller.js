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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const media_service_1 = require("./media.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async getPresignedUrl(userId, body) {
        return this.mediaService.getPresignedUploadUrl(userId, body.fileName, body.contentType, body.fileSize, body.isBroll || false);
    }
    async confirmUpload(userId, body) {
        return this.mediaService.confirmUpload(userId, body.projectId, body.key, body.publicUrl, body.fileData, body.isBroll || false);
    }
    async getProjectMedia(userId, projectId) {
        return this.mediaService.getProjectMedia(projectId, userId);
    }
    async deleteMedia(userId, mediaId) {
        return this.mediaService.deleteMediaFile(mediaId, userId);
    }
    async initiateGoogleDriveAuth(userId) {
        return this.mediaService.initiateGoogleDriveAuth(userId);
    }
    async importFromGoogleDrive(userId, body) {
        return this.mediaService.importFromGoogleDrive(userId, body.driveFileId, body.projectId);
    }
    async searchStockFootage(query, page, perPage) {
        return this.mediaService.searchStockFootage(query, page, perPage);
    }
    async generateAiBroll(userId, body) {
        return this.mediaService.generateAiBroll(userId, body.projectId, body.prompt);
    }
    async getBrollLibrary() {
        return this.mediaService.getBrollLibrary();
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload/presigned'),
    (0, swagger_1.ApiOperation)({ summary: 'Get presigned URL for direct S3 upload' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Post)('upload/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm upload and register media file' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "confirmUpload", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all media files for a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getProjectMedia", null);
__decorate([
    (0, common_1.Delete)(':mediaId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a media file' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('mediaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Get)('google-drive/auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Google Drive OAuth' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "initiateGoogleDriveAuth", null);
__decorate([
    (0, common_1.Post)('google-drive/import'),
    (0, swagger_1.ApiOperation)({ summary: 'Import file from Google Drive' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "importFromGoogleDrive", null);
__decorate([
    (0, common_1.Get)('stock-footage/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search stock footage' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('perPage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "searchStockFootage", null);
__decorate([
    (0, common_1.Post)('ai-broll/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI B-roll' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "generateAiBroll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('brolls/library'),
    (0, swagger_1.ApiOperation)({ summary: 'Get B-roll library with categories and items' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getBrollLibrary", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map