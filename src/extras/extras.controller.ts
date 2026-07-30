import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExtrasService } from './extras.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Extras')
@Controller('extras')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExtrasController {
  constructor(private extrasService: ExtrasService) {}

  // Brand Kit
  @Get('brand-kit')
  @ApiOperation({ summary: 'Get brand kit' })
  async getBrandKit(@CurrentUser('id') userId: string) {
    return this.extrasService.getBrandKit(userId);
  }

  @Post('brand-kit')
  @ApiOperation({ summary: 'Update brand kit' })
  async updateBrandKit(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.extrasService.updateBrandKit(userId, body);
  }

  // Thumbnails
  @Post(':projectId/thumbnail')
  @ApiOperation({ summary: 'Generate AI thumbnail' })
  async generateThumbnail(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { text?: string; frameTime?: number; style?: string },
  ) {
    return this.extrasService.generateThumbnail(userId, projectId, body);
  }

  // Project Versioning
  @Post(':projectId/version')
  @ApiOperation({ summary: 'Save project version' })
  async saveVersion(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { description?: string },
  ) {
    return this.extrasService.saveVersion(userId, projectId, body.description);
  }

  @Get(':projectId/versions')
  @ApiOperation({ summary: 'Get project versions' })
  async getVersions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.extrasService.getVersions(userId, projectId);
  }

  @Post(':projectId/restore/:versionId')
  @ApiOperation({ summary: 'Restore project version' })
  async restoreVersion(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.extrasService.restoreVersion(userId, projectId, versionId);
  }

  // Webhooks
  @Post('webhooks')
  @ApiOperation({ summary: 'Create webhook' })
  async createWebhook(
    @CurrentUser('id') userId: string,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.extrasService.createWebhook(userId, body.url, body.events);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Get webhooks' })
  async getWebhooks(@CurrentUser('id') userId: string) {
    return this.extrasService.getWebhooks(userId);
  }

  @Patch('webhooks/:id')
  @ApiOperation({ summary: 'Update webhook' })
  async updateWebhook(
    @CurrentUser('id') userId: string,
    @Param('id') webhookId: string,
    @Body() body: { url?: string; events?: string[]; isActive?: boolean },
  ) {
    return this.extrasService.updateWebhook(userId, webhookId, body);
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete webhook' })
  async deleteWebhook(
    @CurrentUser('id') userId: string,
    @Param('id') webhookId: string,
  ) {
    return this.extrasService.deleteWebhook(userId, webhookId);
  }

  // SEO
  @Get(':projectId/seo')
  @ApiOperation({ summary: 'Generate SEO metadata' })
  async generateSeoMetadata(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.extrasService.generateSeoMetadata(userId, projectId);
  }

  // Referrals
  @Get('referral/code')
  @ApiOperation({ summary: 'Get referral code' })
  async getReferralCode(@CurrentUser('id') userId: string) {
    return this.extrasService.getReferralCode(userId);
  }

  @Post('referral/apply')
  @ApiOperation({ summary: 'Apply referral code' })
  async applyReferralCode(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string },
  ) {
    return this.extrasService.applyReferralCode(userId, body.code);
  }
}
