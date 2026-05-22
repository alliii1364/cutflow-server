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
}
