import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '21:9'];

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ASPECT_RATIOS })
  @IsOptional()
  @IsIn(ASPECT_RATIOS)
  aspectRatio?: string;
}
