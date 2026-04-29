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
exports.UpdateCaptionsDto = exports.GenerateCaptionsDto = exports.CaptionStyleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CaptionStyleDto {
}
exports.CaptionStyleDto = CaptionStyleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Arial' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CaptionStyleDto.prototype, "font", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#FFFFFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CaptionStyleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 24 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CaptionStyleDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['top', 'bottom', 'middle'], example: 'bottom' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CaptionStyleDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CaptionStyleDto.prototype, "animated", void 0);
class GenerateCaptionsDto {
    constructor() {
        this.language = 'en';
    }
}
exports.GenerateCaptionsDto = GenerateCaptionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'en', description: 'Language code (e.g., en, es, fr). Use "auto" for auto-detection.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateCaptionsDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CaptionStyleDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", CaptionStyleDto)
], GenerateCaptionsDto.prototype, "style", void 0);
class UpdateCaptionsDto {
}
exports.UpdateCaptionsDto = UpdateCaptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Caption segments with timing',
        example: [
            { start: 0, end: 3.5, text: 'Hello everyone!' },
            { start: 3.5, end: 7.2, text: 'Welcome to this video.' },
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateCaptionsDto.prototype, "segments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: CaptionStyleDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", CaptionStyleDto)
], UpdateCaptionsDto.prototype, "style", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCaptionsDto.prototype, "isAnimated", void 0);
//# sourceMappingURL=caption.dto.js.map