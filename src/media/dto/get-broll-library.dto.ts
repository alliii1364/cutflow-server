import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum BrollGender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum BrollEthnicity {
  WHITE = 'white',
  BLACK = 'black',
  ASIAN = 'asian',
  SPANISH = 'spanish',
  SWEDISH = 'swedish',
  ITALIAN = 'italian',
  BRAZILIAN = 'brazilian',
  UKRAINIAN = 'ukrainian',
  EUROPEAN = 'european',
  BRITISH = 'british',
}

export class GetBrollLibraryDto {
  @ApiPropertyOptional({ description: 'Search by name or tags' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: BrollGender })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(BrollGender)
  gender?: BrollGender;

  @ApiPropertyOptional({ enum: BrollEthnicity })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsEnum(BrollEthnicity)
  ethnicity?: BrollEthnicity;

  @ApiPropertyOptional({ minimum: 0, maximum: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  minAge?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  maxAge?: number;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    description: 'Repeat the param or pass a comma-separated list. Values are lowercased.',
    example: ['american', 'british'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value == null || value === '') return undefined;
    const list = Array.isArray(value) ? value : String(value).split(',');
    const cleaned = list
      .map((v) => String(v).trim().toLowerCase())
      .filter((v) => v.length > 0);
    return cleaned.length ? cleaned : undefined;
  })
  @IsString({ each: true })
  nationalities?: string[];
}
