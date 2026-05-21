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
exports.GetBrollLibraryDto = exports.BrollEthnicity = exports.BrollGender = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var BrollGender;
(function (BrollGender) {
    BrollGender["MALE"] = "male";
    BrollGender["FEMALE"] = "female";
})(BrollGender || (exports.BrollGender = BrollGender = {}));
var BrollEthnicity;
(function (BrollEthnicity) {
    BrollEthnicity["WHITE"] = "white";
    BrollEthnicity["BLACK"] = "black";
    BrollEthnicity["ASIAN"] = "asian";
    BrollEthnicity["SPANISH"] = "spanish";
    BrollEthnicity["SWEDISH"] = "swedish";
    BrollEthnicity["ITALIAN"] = "italian";
    BrollEthnicity["BRAZILIAN"] = "brazilian";
    BrollEthnicity["UKRAINIAN"] = "ukrainian";
    BrollEthnicity["EUROPEAN"] = "european";
    BrollEthnicity["BRITISH"] = "british";
})(BrollEthnicity || (exports.BrollEthnicity = BrollEthnicity = {}));
class GetBrollLibraryDto {
}
exports.GetBrollLibraryDto = GetBrollLibraryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by name or tags' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetBrollLibraryDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: BrollGender }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value)),
    (0, class_validator_1.IsEnum)(BrollGender),
    __metadata("design:type", String)
], GetBrollLibraryDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: BrollEthnicity }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value)),
    (0, class_validator_1.IsEnum)(BrollEthnicity),
    __metadata("design:type", String)
], GetBrollLibraryDto.prototype, "ethnicity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 120 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], GetBrollLibraryDto.prototype, "minAge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 0, maximum: 120 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], GetBrollLibraryDto.prototype, "maxAge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        isArray: true,
        type: String,
        description: 'Repeat the param or pass a comma-separated list. Values are lowercased.',
        example: ['american', 'british'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value == null || value === '')
            return undefined;
        const list = Array.isArray(value) ? value : String(value).split(',');
        const cleaned = list
            .map((v) => String(v).trim().toLowerCase())
            .filter((v) => v.length > 0);
        return cleaned.length ? cleaned : undefined;
    }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GetBrollLibraryDto.prototype, "nationalities", void 0);
//# sourceMappingURL=get-broll-library.dto.js.map