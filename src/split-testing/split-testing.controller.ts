import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SplitTestingService } from './split-testing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Split Testing')
@Controller('split-testing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SplitTestingController {
  constructor(private splitTestingService: SplitTestingService) {}

  @Post(':projectId/create')
  @ApiOperation({ summary: 'Create split test variants' })
  async createSplitTest(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
    @Body() body: {
      testHooks?: boolean;
      testCaptions?: boolean;
      testMusic?: boolean;
      testVoice?: boolean;
      variantCount?: number;
    },
  ) {
    return this.splitTestingService.createSplitTest(userId, projectId, body);
  }

  @Get(':sessionId/variants')
  @ApiOperation({ summary: 'Get all variants for a session' })
  async getVariants(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.splitTestingService.getVariants(userId, sessionId);
  }

  @Post(':sessionId/export-all')
  @ApiOperation({ summary: 'Export all variants' })
  async exportAllVariants(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.splitTestingService.exportAllVariants(userId, sessionId);
  }

  @Get(':sessionId/status')
  @ApiOperation({ summary: 'Get export status' })
  async getExportStatus(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.splitTestingService.getExportStatus(userId, sessionId);
  }
}
