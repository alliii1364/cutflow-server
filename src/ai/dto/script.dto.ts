import { IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScriptTone {
  SALES = 'sales',
  EDUCATIONAL = 'educational',
  EMOTIONAL = 'emotional',
  STORYTELLING = 'storytelling',
  PROFESSIONAL = 'professional',
}

export class GenerateScriptDto {
  @ApiProperty({ enum: ['website', 'text', 'product'], example: 'text' })
  @IsEnum(['website', 'text', 'product'])
  sourceType: 'website' | 'text' | 'product';

  @ApiProperty({ 
    example: 'Learn how to create amazing videos with AI technology...',
    description: 'Website URL, product description, or custom text' 
  })
  @IsString()
  sourceContent: string;

  @ApiProperty({ enum: ScriptTone, default: ScriptTone.PROFESSIONAL })
  @IsEnum(ScriptTone)
  tone: ScriptTone = ScriptTone.PROFESSIONAL;

  @ApiPropertyOptional({ example: 60, description: 'Target duration in seconds' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional()
  @IsString()
  language?: string = 'en';
}

export class GenerateHooksDto {
  @ApiProperty({ 
    example: 'Learn how to create amazing videos with AI technology...',
    description: 'Content to generate hooks from' 
  })
  @IsString()
  sourceContent: string;

  @ApiPropertyOptional({ example: 3, description: 'Number of hook variations to generate' })
  @IsOptional()
  @IsNumber()
  count?: number = 3;
}

export class UpdateScriptDto {
  @ApiPropertyOptional({ example: 'My Video Script' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Script content here...' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class ApplyScriptDto {
  @ApiPropertyOptional({ example: true, description: 'Create text clips from script segments' })
  @IsOptional()
  createClips?: boolean = true;

  @ApiPropertyOptional({ example: true, description: 'Generate voiceover from script' })
  @IsOptional()
  generateVoice?: boolean = false;
}
