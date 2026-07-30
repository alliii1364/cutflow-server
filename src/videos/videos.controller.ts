import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { SaveProjectStateDto } from './dto/save-project-state.dto';
import { ExportVideoDto } from './dto/export-video.dto';

@ApiTags('Videos')
@Controller('videos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  @ApiOperation({ summary: 'Create new video project' })
  async createProject(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.videosService.createProject(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user video projects' })
  async getUserProjects(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.videosService.getUserProjects(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  async getProject(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.getProject(userId, projectId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async updateProject(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.videosService.updateProject(userId, projectId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async deleteProject(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.deleteProject(userId, projectId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get project processing status' })
  async getProjectStatus(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.getProjectStatus(userId, projectId);
  }

  // Project State Endpoints for Frontend Sync

  @Post(':id/state')
  @ApiOperation({ summary: 'Save full project state (timeline, composition, settings)' })
  async saveProjectState(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: SaveProjectStateDto,
  ) {
    return this.videosService.saveProjectState(userId, projectId, dto);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Load full project state' })
  async loadProjectState(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.loadProjectState(userId, projectId);
  }

  @Post(':id/state/export')
  @ApiOperation({ summary: 'Export project state to JSON file' })
  async exportProjectState(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.exportProjectState(userId, projectId);
  }

  // Video Export Endpoints

  @Post(':id/export')
  @ApiOperation({ summary: 'Start video export/render' })
  async startExport(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
    @Body() dto: ExportVideoDto,
  ) {
    return this.videosService.startExport(userId, projectId, dto);
  }

  @Get(':id/exports')
  @ApiOperation({ summary: 'Get all exports for a project' })
  async getProjectExports(
    @CurrentUser('id') userId: string,
    @Param('id') projectId: string,
  ) {
    return this.videosService.getProjectExports(userId, projectId);
  }

  @Get('exports/:exportId/status')
  @ApiOperation({ summary: 'Get export status and progress' })
  async getExportStatus(
    @CurrentUser('id') userId: string,
    @Param('exportId') exportId: string,
  ) {
    return this.videosService.getExportStatus(userId, exportId);
  }

  @Get('exports/:exportId/download')
  @ApiOperation({ summary: 'Get download URL for completed export' })
  async getExportDownloadUrl(
    @CurrentUser('id') userId: string,
    @Param('exportId') exportId: string,
  ) {
    return this.videosService.getExportDownloadUrl(userId, exportId);
  }
}
