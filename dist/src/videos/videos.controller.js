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
exports.VideosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const videos_service_1 = require("./videos.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const save_project_state_dto_1 = require("./dto/save-project-state.dto");
const export_video_dto_1 = require("./dto/export-video.dto");
let VideosController = class VideosController {
    constructor(videosService) {
        this.videosService = videosService;
    }
    async createProject(userId, dto) {
        return this.videosService.createProject(userId, dto);
    }
    async getUserProjects(userId, page = 1, limit = 20) {
        return this.videosService.getUserProjects(userId, page, limit);
    }
    async getProject(userId, projectId) {
        return this.videosService.getProject(userId, projectId);
    }
    async updateProject(userId, projectId, dto) {
        return this.videosService.updateProject(userId, projectId, dto);
    }
    async deleteProject(userId, projectId) {
        return this.videosService.deleteProject(userId, projectId);
    }
    async getProjectStatus(userId, projectId) {
        return this.videosService.getProjectStatus(userId, projectId);
    }
    async saveProjectState(userId, projectId, dto) {
        return this.videosService.saveProjectState(userId, projectId, dto);
    }
    async loadProjectState(userId, projectId) {
        return this.videosService.loadProjectState(userId, projectId);
    }
    async exportProjectState(userId, projectId) {
        return this.videosService.exportProjectState(userId, projectId);
    }
    async startExport(userId, projectId, dto) {
        return this.videosService.startExport(userId, projectId, dto);
    }
    async getProjectExports(userId, projectId) {
        return this.videosService.getProjectExports(userId, projectId);
    }
    async getExportStatus(userId, exportId) {
        return this.videosService.getExportStatus(userId, exportId);
    }
    async getExportDownloadUrl(userId, exportId) {
        return this.videosService.getExportDownloadUrl(userId, exportId);
    }
};
exports.VideosController = VideosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new video project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user video projects' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getUserProjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project details' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getProject", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "deleteProject", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project processing status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getProjectStatus", null);
__decorate([
    (0, common_1.Post)(':id/state'),
    (0, swagger_1.ApiOperation)({ summary: 'Save full project state (timeline, composition, settings)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, save_project_state_dto_1.SaveProjectStateDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "saveProjectState", null);
__decorate([
    (0, common_1.Get)(':id/state'),
    (0, swagger_1.ApiOperation)({ summary: 'Load full project state' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "loadProjectState", null);
__decorate([
    (0, common_1.Post)(':id/state/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export project state to JSON file' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "exportProjectState", null);
__decorate([
    (0, common_1.Post)(':id/export'),
    (0, swagger_1.ApiOperation)({ summary: 'Start video export/render' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, export_video_dto_1.ExportVideoDto]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "startExport", null);
__decorate([
    (0, common_1.Get)(':id/exports'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all exports for a project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getProjectExports", null);
__decorate([
    (0, common_1.Get)('exports/:exportId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get export status and progress' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('exportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getExportStatus", null);
__decorate([
    (0, common_1.Get)('exports/:exportId/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Get download URL for completed export' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('exportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getExportDownloadUrl", null);
exports.VideosController = VideosController = __decorate([
    (0, swagger_1.ApiTags)('Videos'),
    (0, common_1.Controller)('videos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [videos_service_1.VideosService])
], VideosController);
//# sourceMappingURL=videos.controller.js.map