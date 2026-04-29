import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiEditingService } from './ai-editing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI Editing')
@Controller('ai-editing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiEditingController {
  constructor(private aiEditingService: AiEditingService) {}

  @Post(':projectId/silence-removal')
  @ApiOperation({ summary: 'Remove silence from video' })
  async removeSilence(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { threshold?: number; minDuration?: number },
  ) {
    return this.aiEditingService.removeSilence(userId, projectId, body);
  }

  @Post(':projectId/resize')
  @ApiOperation({ summary: 'Resize video to target aspect ratio' })
  async resizeVideo(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { aspectRatio: string },
  ) {
    return this.aiEditingService.resizeVideo(userId, projectId, body.aspectRatio);
  }

  @Post(':projectId/filters')
  @ApiOperation({ summary: 'Apply filters to video' })
  async applyFilters(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      blur?: number;
      preset?: string;
    },
  ) {
    return this.aiEditingService.applyFilters(userId, projectId, body);
  }

  @Post(':projectId/zoom-effects')
  @ApiOperation({ summary: 'Add zoom hook effects' })
  async addZoomEffects(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { timestamps: number[] },
  ) {
    return this.aiEditingService.addZoomEffects(userId, projectId, body.timestamps);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get job status' })
  async getJobStatus(
    @CurrentUser('id') userId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.aiEditingService.getJobStatus(jobId, userId);
  }

  @Get('project/:projectId/jobs')
  @ApiOperation({ summary: 'Get all jobs for a project' })
  async getProjectJobs(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.aiEditingService.getProjectJobs(projectId, userId);
  }
}
