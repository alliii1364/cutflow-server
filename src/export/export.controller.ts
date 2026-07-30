import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post(':projectId')
  @ApiOperation({ summary: 'Queue video export' })
  async queueExport(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      resolution: 'P720' | 'P1080' | 'P4K';
      platform?: 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TWITTER';
    },
  ) {
    return this.exportService.queueExport(userId, projectId, body);
  }

  @Get(':exportId/status')
  @ApiOperation({ summary: 'Get export status' })
  async getExportStatus(
    @CurrentUser('id') userId: string,
    @Param('exportId') exportId: string,
  ) {
    return this.exportService.getExportStatus(userId, exportId);
  }

  @Get(':exportId/download')
  @ApiOperation({ summary: 'Get download URL' })
  async getDownloadUrl(
    @CurrentUser('id') userId: string,
    @Param('exportId') exportId: string,
  ) {
    return this.exportService.getExportDownloadUrl(userId, exportId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all exports for a project' })
  async getProjectExports(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.exportService.getProjectExports(userId, projectId);
  }

  @Post(':exportId/google-drive')
  @ApiOperation({ summary: 'Push export to Google Drive' })
  async pushToGoogleDrive(
    @CurrentUser('id') userId: string,
    @Param('exportId') exportId: string,
  ) {
    return this.exportService.pushToGoogleDrive(userId, exportId);
  }
}
