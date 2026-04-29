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
exports.ScriptsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scripts_service_1 = require("./scripts.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ScriptsController = class ScriptsController {
    constructor(scriptsService) {
        this.scriptsService = scriptsService;
    }
    async generateScript(userId, projectId, body) {
        return this.scriptsService.generateScript(userId, projectId, body);
    }
    async getScript(userId, projectId) {
        return this.scriptsService.getScript(userId, projectId);
    }
    async generateHooks(userId, projectId, body) {
        return this.scriptsService.generateHooks(userId, projectId, body);
    }
    async applyHook(userId, projectId, body) {
        return this.scriptsService.applyHook(userId, projectId, body.hookIndex);
    }
};
exports.ScriptsController = ScriptsController;
__decorate([
    (0, common_1.Post)(':projectId/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI script' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "generateScript", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get script for project' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "getScript", null);
__decorate([
    (0, common_1.Post)(':projectId/hooks'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate hook variations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "generateHooks", null);
__decorate([
    (0, common_1.Patch)(':projectId/apply-hook'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply selected hook to script' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ScriptsController.prototype, "applyHook", null);
exports.ScriptsController = ScriptsController = __decorate([
    (0, swagger_1.ApiTags)('Scripts'),
    (0, common_1.Controller)('scripts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scripts_service_1.ScriptsService])
], ScriptsController);
//# sourceMappingURL=scripts.controller.js.map