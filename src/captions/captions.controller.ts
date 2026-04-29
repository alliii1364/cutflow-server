import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CaptionsService } from './captions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Captions')
@Controller('captions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CaptionsController {
  constructor(private captionsService: CaptionsService) {}

  @Post(':projectId/generate')
  @ApiOperation({ summary: 'Generate captions using Whisper' })
  async generateCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { language?: string },
  ) {
    return this.captionsService.generateCaptions(userId, projectId, body.language || 'en');
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get captions for project' })
  async getCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.captionsService.getCaptions(userId, projectId);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update captions' })
  async updateCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      segments?: any[];
      style?: any;
      keywords?: string[];
      isAnimated?: boolean;
      wordHighlighting?: boolean;
    },
  ) {
    return this.captionsService.updateCaptions(userId, projectId, body);
  }

  @Post(':projectId/keywords')
  @ApiOperation({ summary: 'Extract keywords from captions' })
  async extractKeywords(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.captionsService.extractKeywords(userId, projectId);
  }

  @Post(':projectId/animate')
  @ApiOperation({ summary: 'Apply animated caption style' })
  async applyAnimatedStyle(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { style: string },
  ) {
    return this.captionsService.applyAnimatedStyle(userId, projectId, body.style);
  }
}
