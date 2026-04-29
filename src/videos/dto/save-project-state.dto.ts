import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveProjectStateDto {
  @ApiProperty({
    description: 'Full project state object including timeline, composition, settings',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  state: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Optional thumbnail URL for the project',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
