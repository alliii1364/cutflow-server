import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '21:9'];

export class CreateProjectDto {
  @ApiProperty({ example: 'My Video Project' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Project description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ASPECT_RATIOS, default: '16:9' })
  @IsOptional()
  @IsIn(ASPECT_RATIOS)
  aspectRatio?: string = '16:9';
}
