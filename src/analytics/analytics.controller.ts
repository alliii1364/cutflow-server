import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('user/dashboard')
  @ApiOperation({ summary: 'Get user analytics dashboard' })
  async getUserDashboard(@CurrentUser('id') userId: string) {
    return this.analyticsService.getUserDashboard(userId);
  }

  @Get('popular-features')
  @ApiOperation({ summary: 'Get popular features' })
  async getPopularFeatures() {
    return this.analyticsService.getPopularFeatures();
  }

  @Get('admin/overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin platform metrics' })
  async getAdminPlatformMetrics() {
    return this.analyticsService.getAdminPlatformMetrics();
  }
}
