import { IsString, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CaptionStyleDto {
  @ApiPropertyOptional({ example: 'Arial' })
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ enum: ['top', 'bottom', 'middle'], example: 'bottom' })
  @IsOptional()
  @IsString()
  position?: 'top' | 'bottom' | 'middle';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  animated?: boolean;
}

export class GenerateCaptionsDto {
  @ApiProperty({ example: 'en', description: 'Language code (e.g., en, es, fr). Use "auto" for auto-detection.' })
  @IsString()
  language: string = 'en';

  @ApiPropertyOptional({ type: CaptionStyleDto })
  @IsOptional()
  @IsObject()
  style?: CaptionStyleDto;
}

export class UpdateCaptionsDto {
  @ApiPropertyOptional({
    description: 'Caption segments with timing',
    example: [
      { start: 0, end: 3.5, text: 'Hello everyone!' },
      { start: 3.5, end: 7.2, text: 'Welcome to this video.' },
    ],
  })
  @IsOptional()
  @IsArray()
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    words?: Array<{
      word: string;
      start: number;
      end: number;
    }>;
  }>;

  @ApiPropertyOptional({ type: CaptionStyleDto })
  @IsOptional()
  @IsObject()
  style?: CaptionStyleDto;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnimated?: boolean;
}
