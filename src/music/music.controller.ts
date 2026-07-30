import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Music')
@Controller('music')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MusicController {
  constructor(private musicService: MusicService) {}

  @Post(':projectId/generate')
  @ApiOperation({ summary: 'Generate AI music' })
  async generateMusic(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      style: 'CALM' | 'ENERGETIC' | 'CORPORATE' | 'EMOTIONAL' | 'UPBEAT' | 'EPIC';
      duration: number;
      mood?: string;
    },
  ) {
    return this.musicService.generateMusic(userId, projectId, body);
  }

  @Post(':projectId/mood-match')
  @ApiOperation({ summary: 'Auto-detect mood and match music' })
  async detectMoodAndMatch(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.musicService.detectMoodAndMatchMusic(userId, projectId);
  }

  @Get(':projectId/beat-sync')
  @ApiOperation({ summary: 'Get beat sync timestamps' })
  async getBeatSyncTimestamps(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.musicService.getBeatSyncTimestamps(projectId, userId);
  }

  @Post(':projectId/assign')
  @ApiOperation({ summary: 'Assign music track to project' })
  async assignMusic(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { musicTrackId: string },
  ) {
    return this.musicService.assignMusicToProject(userId, projectId, body.musicTrackId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get assigned music for project' })
  async getProjectMusic(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.musicService.getProjectMusic(userId, projectId);
  }
}
