import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List templates' })
  async getTemplates(
    @Query('category') category?: string,
    @Query('platform') platform?: string,
    @Query('industry') industry?: string,
    @Query('style') style?: string,
    @Query('tier') tier?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.templatesService.getTemplates({
      category,
      platform,
      industry,
      style,
      tier,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template details' })
  async getTemplateById(@Param('id') templateId: string) {
    return this.templatesService.getTemplateById(templateId);
  }

  @Post(':templateId/apply/:projectId')
  @ApiOperation({ summary: 'Apply template to project' })
  async applyTemplate(
    @CurrentUser('id') userId: string,
    @Param('templateId') templateId: string,
    @Param('projectId') projectId: string,
    @Body() body: { customConfig?: any },
  ) {
    return this.templatesService.applyTemplate(userId, projectId, templateId, body.customConfig);
  }

  @Get('assets/list')
  @ApiOperation({ summary: 'List creative assets' })
  async getAssets(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('tier') tier?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.templatesService.getAssets({ type, category, tier, page, limit });
  }

  @Get('assets/:id')
  @ApiOperation({ summary: 'Get asset details' })
  async getAssetById(@Param('id') assetId: string) {
    return this.templatesService.getAssetById(assetId);
  }

  @Post('user/save')
  @ApiOperation({ summary: 'Save template to user library' })
  async saveUserTemplate(
    @CurrentUser('id') userId: string,
    @Body() body: { templateId: string; customName?: string; customConfig?: any },
  ) {
    return this.templatesService.saveUserTemplate(userId, body.templateId, body.customName, body.customConfig);
  }

  @Get('user/my-templates')
  @ApiOperation({ summary: 'Get user saved templates' })
  async getUserTemplates(@CurrentUser('id') userId: string) {
    return this.templatesService.getUserTemplates(userId);
  }

  @Delete('user/:templateId')
  @ApiOperation({ summary: 'Delete user saved template' })
  async deleteUserTemplate(
    @CurrentUser('id') userId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.templatesService.deleteUserTemplate(userId, templateId);
  }
}
