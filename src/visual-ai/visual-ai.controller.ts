import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisualAiService } from './visual-ai.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Visual AI')
@Controller('visual-ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VisualAiController {
  constructor(private visualAiService: VisualAiService) {}

  @Post(':projectId/bg-remove')
  @ApiOperation({ summary: 'Remove background from video' })
  async removeBackground(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      backgroundType: 'color' | 'image' | 'video';
      backgroundValue?: string;
    },
  ) {
    return this.visualAiService.removeBackground(userId, projectId, body);
  }

  @Post(':projectId/bg-replace')
  @ApiOperation({ summary: 'Replace background' })
  async replaceBackground(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      backgroundType: 'color' | 'image' | 'video';
      backgroundValue: string;
    },
  ) {
    return this.visualAiService.replaceBackground(userId, projectId, body);
  }

  @Post(':projectId/watermark-remove')
  @ApiOperation({ summary: 'Remove watermark from video' })
  async removeWatermark(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { watermarkArea?: { x: number; y: number; width: number; height: number } },
  ) {
    return this.visualAiService.removeWatermark(userId, projectId, body?.watermarkArea);
  }

  @Post(':projectId/similarity')
  @ApiOperation({ summary: 'Create similar style video' })
  async createSimilarStyle(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { referenceVideoUrl: string },
  ) {
    return this.visualAiService.createSimilarStyle(userId, projectId, body.referenceVideoUrl);
  }
}
