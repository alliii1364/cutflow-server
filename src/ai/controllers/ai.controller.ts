import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CaptionService } from '../services/caption.service';
import { ScriptService } from '../services/script.service';
import { GenerateCaptionsDto, UpdateCaptionsDto } from '../dto/caption.dto';
import { GenerateScriptDto, GenerateHooksDto, UpdateScriptDto, ApplyScriptDto } from '../dto/script.dto';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(
    private captionService: CaptionService,
    private scriptService: ScriptService,
  ) {}

  // Caption Endpoints

  @Post('captions/generate/:projectId')
  @ApiOperation({ summary: 'Generate captions using AI (Whisper)' })
  async generateCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateCaptionsDto,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.captionService.generateCaptions(
      projectId,
      dto.language,
      dto.style,
    );
  }

  @Get('captions/:projectId')
  @ApiOperation({ summary: 'Get captions for a project' })
  async getCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.captionService.getCaptions(projectId);
  }

  @Patch('captions/:projectId')
  @ApiOperation({ summary: 'Update captions (manual editing)' })
  async updateCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateCaptionsDto,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.captionService.updateCaptions(projectId, dto);
  }

  @Delete('captions/:projectId')
  @ApiOperation({ summary: 'Delete captions' })
  async deleteCaptions(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.captionService.deleteCaptions(projectId);
  }

  // Script Endpoints

  @Post('scripts/generate/:projectId')
  @ApiOperation({ summary: 'Generate video script using GPT-4' })
  async generateScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: GenerateScriptDto,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.scriptService.generateScript(projectId, dto);
  }

  @Get('scripts/:projectId')
  @ApiOperation({ summary: 'Get generated script for a project' })
  async getScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.scriptService.getScript(projectId);
  }

  @Patch('scripts/:projectId')
  @ApiOperation({ summary: 'Update script (manual editing)' })
  async updateScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateScriptDto,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.scriptService.updateScript(projectId, dto);
  }

  @Delete('scripts/:projectId')
  @ApiOperation({ summary: 'Delete script' })
  async deleteScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return this.scriptService.deleteScript(projectId);
  }

  @Post('hooks/generate')
  @ApiOperation({ summary: 'Generate hook variations' })
  async generateHooks(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateHooksDto,
  ) {
    return this.scriptService.generateHooks('temp', dto.sourceContent, dto.count);
  }

  @Post('scripts/:projectId/apply')
  @ApiOperation({ summary: 'Apply script to timeline (create text clips)' })
  async applyScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: ApplyScriptDto,
  ) {
    // Verify project ownership
    const project = await this.captionService['prisma'].videoProject.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // TODO: Implement script to timeline conversion
    return {
      success: true,
      message: 'Script applied to timeline',
      createClips: dto.createClips,
      generateVoice: dto.generateVoice,
    };
  }
}
