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
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Users
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') userId: string,
    @Body() body: { role?: UserRole; isActive?: boolean; planId?: string },
  ) {
    return this.adminService.updateUser(userId, body);
  }

  // Subscriptions
  @Get('subscriptions')
  @ApiOperation({ summary: 'List all subscriptions' })
  async getAllSubscriptions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllSubscriptions(page, limit);
  }

  // Templates
  @Post('templates')
  @ApiOperation({ summary: 'Create template' })
  async createTemplate(@Body() body: any) {
    return this.adminService.createTemplate(body);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update template' })
  async updateTemplate(
    @Param('id') templateId: string,
    @Body() body: any,
  ) {
    return this.adminService.updateTemplate(templateId, body);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete template' })
  async deleteTemplate(@Param('id') templateId: string) {
    return this.adminService.deleteTemplate(templateId);
  }

  // Assets
  @Post('assets')
  @ApiOperation({ summary: 'Create creative asset' })
  async createAsset(@Body() body: any) {
    return this.adminService.createAsset(body);
  }

  @Patch('assets/:id')
  @ApiOperation({ summary: 'Update asset' })
  async updateAsset(
    @Param('id') assetId: string,
    @Body() body: any,
  ) {
    return this.adminService.updateAsset(assetId, body);
  }

  // Feature Flags
  @Get('feature-flags')
  @ApiOperation({ summary: 'List feature flags' })
  async getFeatureFlags() {
    return this.adminService.getFeatureFlags();
  }

  @Post('feature-flags')
  @ApiOperation({ summary: 'Create feature flag' })
  async createFeatureFlag(@Body() body: any) {
    return this.adminService.createFeatureFlag(body);
  }

  @Patch('feature-flags/:id')
  @ApiOperation({ summary: 'Update feature flag' })
  async updateFeatureFlag(
    @Param('id') flagId: string,
    @Body() body: any,
  ) {
    return this.adminService.updateFeatureFlag(flagId, body);
  }

  // Analytics
  @Get('analytics/overview')
  @ApiOperation({ summary: 'Platform overview' })
  async getPlatformOverview() {
    return this.adminService.getPlatformOverview();
  }
}
