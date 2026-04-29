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
import { ScriptsService } from './scripts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Scripts')
@Controller('scripts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScriptsController {
  constructor(private scriptsService: ScriptsService) {}

  @Post(':projectId/generate')
  @ApiOperation({ summary: 'Generate AI script' })
  async generateScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      sourceType: 'url' | 'text' | 'product_page';
      sourceContent: string;
      tone: 'sales' | 'educational' | 'emotional' | 'storytelling';
      targetDuration?: number;
    },
  ) {
    return this.scriptsService.generateScript(userId, projectId, body);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get script for project' })
  async getScript(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.scriptsService.getScript(userId, projectId);
  }

  @Post(':projectId/hooks')
  @ApiOperation({ summary: 'Generate hook variations' })
  async generateHooks(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { count?: number; type?: 'ad' | 'reel' | 'short' },
  ) {
    return this.scriptsService.generateHooks(userId, projectId, body);
  }

  @Patch(':projectId/apply-hook')
  @ApiOperation({ summary: 'Apply selected hook to script' })
  async applyHook(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: { hookIndex: number },
  ) {
    return this.scriptsService.applyHook(userId, projectId, body.hookIndex);
  }
}
