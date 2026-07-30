import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportResolution {
  P720 = 'P720',
  P1080 = 'P1080',
  P4K = 'P4K',
}

export enum ExportPlatform {
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
}

export class ExportVideoDto {
  @ApiProperty({ enum: ExportResolution, default: ExportResolution.P1080 })
  @IsEnum(ExportResolution)
  resolution: ExportResolution = ExportResolution.P1080;

  @ApiPropertyOptional({ enum: ExportPlatform })
  @IsOptional()
  @IsEnum(ExportPlatform)
  platform?: ExportPlatform;
}
