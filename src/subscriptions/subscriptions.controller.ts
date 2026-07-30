import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  RawBody,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get available subscription plans' })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription' })
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getUserSubscription(userId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckout(
    @CurrentUser('id') userId: string,
    @Body('planId') planId: string,
  ) {
    return this.subscriptionsService.createCheckoutSession(userId, planId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe billing portal session' })
  async createBillingPortal(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.createBillingPortalSession(userId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.subscriptionsService.handleWebhook(payload, signature);
  }
}
