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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportVideoDto = exports.ExportPlatform = exports.ExportResolution = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ExportResolution;
(function (ExportResolution) {
    ExportResolution["P720"] = "P720";
    ExportResolution["P1080"] = "P1080";
    ExportResolution["P4K"] = "P4K";
})(ExportResolution || (exports.ExportResolution = ExportResolution = {}));
var ExportPlatform;
(function (ExportPlatform) {
    ExportPlatform["YOUTUBE"] = "YOUTUBE";
    ExportPlatform["TIKTOK"] = "TIKTOK";
    ExportPlatform["INSTAGRAM"] = "INSTAGRAM";
    ExportPlatform["FACEBOOK"] = "FACEBOOK";
    ExportPlatform["LINKEDIN"] = "LINKEDIN";
    ExportPlatform["TWITTER"] = "TWITTER";
})(ExportPlatform || (exports.ExportPlatform = ExportPlatform = {}));
class ExportVideoDto {
    constructor() {
        this.resolution = ExportResolution.P1080;
    }
}
exports.ExportVideoDto = ExportVideoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ExportResolution, default: ExportResolution.P1080 }),
    (0, class_validator_1.IsEnum)(ExportResolution),
    __metadata("design:type", String)
], ExportVideoDto.prototype, "resolution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ExportPlatform }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ExportPlatform),
    __metadata("design:type", String)
], ExportVideoDto.prototype, "platform", void 0);
//# sourceMappingURL=export-video.dto.js.map