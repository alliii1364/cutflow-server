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
exports.ApplyScriptDto = exports.UpdateScriptDto = exports.GenerateHooksDto = exports.GenerateScriptDto = exports.ScriptTone = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ScriptTone;
(function (ScriptTone) {
    ScriptTone["SALES"] = "sales";
    ScriptTone["EDUCATIONAL"] = "educational";
    ScriptTone["EMOTIONAL"] = "emotional";
    ScriptTone["STORYTELLING"] = "storytelling";
    ScriptTone["PROFESSIONAL"] = "professional";
})(ScriptTone || (exports.ScriptTone = ScriptTone = {}));
class GenerateScriptDto {
    constructor() {
        this.tone = ScriptTone.PROFESSIONAL;
        this.language = 'en';
    }
}
exports.GenerateScriptDto = GenerateScriptDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['website', 'text', 'product'], example: 'text' }),
    (0, class_validator_1.IsEnum)(['website', 'text', 'product']),
    __metadata("design:type", String)
], GenerateScriptDto.prototype, "sourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Learn how to create amazing videos with AI technology...',
        description: 'Website URL, product description, or custom text'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateScriptDto.prototype, "sourceContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ScriptTone, default: ScriptTone.PROFESSIONAL }),
    (0, class_validator_1.IsEnum)(ScriptTone),
    __metadata("design:type", String)
], GenerateScriptDto.prototype, "tone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60, description: 'Target duration in seconds' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateScriptDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'en' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateScriptDto.prototype, "language", void 0);
class GenerateHooksDto {
    constructor() {
        this.count = 3;
    }
}
exports.GenerateHooksDto = GenerateHooksDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Learn how to create amazing videos with AI technology...',
        description: 'Content to generate hooks from'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateHooksDto.prototype, "sourceContent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3, description: 'Number of hook variations to generate' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GenerateHooksDto.prototype, "count", void 0);
class UpdateScriptDto {
}
exports.UpdateScriptDto = UpdateScriptDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'My Video Script' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScriptDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Script content here...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScriptDto.prototype, "content", void 0);
class ApplyScriptDto {
    constructor() {
        this.createClips = true;
        this.generateVoice = false;
    }
}
exports.ApplyScriptDto = ApplyScriptDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Create text clips from script segments' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApplyScriptDto.prototype, "createClips", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Generate voiceover from script' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApplyScriptDto.prototype, "generateVoice", void 0);
//# sourceMappingURL=script.dto.js.map