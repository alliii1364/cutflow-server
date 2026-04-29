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
exports.SaveProjectStateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SaveProjectStateDto {
}
exports.SaveProjectStateDto = SaveProjectStateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full project state object including timeline, composition, settings',
        type: 'object',
        additionalProperties: true,
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveProjectStateDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional thumbnail URL for the project',
        example: 'https://example.com/thumbnail.jpg',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveProjectStateDto.prototype, "thumbnailUrl", void 0);
//# sourceMappingURL=save-project-state.dto.js.map