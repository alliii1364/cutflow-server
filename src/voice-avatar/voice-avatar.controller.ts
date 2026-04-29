import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VoiceAvatarService } from './voice-avatar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Voice & Avatar')
@Controller('voice-avatar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoiceAvatarController {
  constructor(private voiceAvatarService: VoiceAvatarService) {}

  @Get('voices')
  @ApiOperation({ summary: 'Get available AI voices' })
  async getAvailableVoices() {
    return this.voiceAvatarService.getAvailableVoices();
  }

  @Post(':projectId/voice')
  @ApiOperation({ summary: 'Generate AI voiceover' })
  async generateVoiceover(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { script?: string; voiceId: string; voiceName: string },
  ) {
    return this.voiceAvatarService.generateVoiceover(userId, projectId, body);
  }

  @Get('avatars')
  @ApiOperation({ summary: 'Get available avatar options' })
  async getAvatarOptions() {
    return this.voiceAvatarService.getAvatarOptions();
  }

  @Post(':projectId/avatar')
  @ApiOperation({ summary: 'Generate AI avatar presenter' })
  async generateAvatar(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { avatarId: string; script?: string; voiceId?: string },
  ) {
    return this.voiceAvatarService.generateAvatar(userId, projectId, body);
  }

  @Post(':projectId/assign-voice')
  @ApiOperation({ summary: 'Assign voice track to project' })
  async assignVoice(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { voiceTrackId: string },
  ) {
    return this.voiceAvatarService.assignVoiceToProject(userId, projectId, body.voiceTrackId);
  }
}
