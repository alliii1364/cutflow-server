import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

// Use require for Stripe to avoid TypeScript issues
const Stripe = require('stripe');

@Injectable()
export class SubscriptionsService {
  private stripe: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeKey) {
      this.stripe = Stripe(stripeKey);
    }
  }

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getUserSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  }

  async createCheckoutSession(userId: string, planId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.stripePriceId) {
      throw new NotFoundException('Plan not found or not available for purchase');
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/subscription/cancel`,
      metadata: { userId: user.id, planId: plan.id },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createBillingPortalSession(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('No active subscription found');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/billing`,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) return;

    // Fetch the actual Stripe subscription to get real period dates
    let periodStart = new Date();
    let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (session.subscription) {
      try {
        const stripeSub = await this.stripe.subscriptions.retrieve(session.subscription as string);
        periodStart = new Date(stripeSub.current_period_start * 1000);
        periodEnd = new Date(stripeSub.current_period_end * 1000);
      } catch {
        // fallback to default dates on Stripe API failure
      }
    }

    await this.prisma.subscription.update({
      where: { userId },
      data: {
        planId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  private async handlePaymentSucceeded(invoice: any) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodEnd: new Date((invoice.period_end || Date.now()) * 1000),
      },
    });
  }

  private async handlePaymentFailed(invoice: any) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'PAST_DUE' },
    });
  }

  private async handleSubscriptionCanceled(stripeSubscription: any) {
    await this.prisma.subscription.updateMany({
      where: { stripeSubscriptionId: stripeSubscription.id },
      data: { status: 'CANCELED', canceledAt: new Date() },
    });
  }

  // Subscription guard helper
  async checkVideoCreationAllowed(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    subscription: any;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found', subscription: null };
    }

    // Free tier: 1 video max
    if (subscription.plan.tier === 'FREE') {
      const videoCount = await this.prisma.videoProject.count({
        where: { userId, isDeleted: false },
      });

      if (videoCount >= 1) {
        return {
          allowed: false,
          reason: 'Free tier allows only 1 video. Please upgrade to create more.',
          subscription,
        };
      }
    }

    // Check active subscription for paid tiers
    if (subscription.plan.tier !== 'FREE' && subscription.status !== 'ACTIVE') {
      return {
        allowed: false,
        reason: 'Subscription is not active. Please renew your subscription.',
        subscription,
      };
    }

    // Check video limit for paid plans
    if (subscription.plan.videoLimit > 0) {
      const videoCount = await this.prisma.videoProject.count({
        where: { userId, isDeleted: false },
      });

      if (videoCount >= subscription.plan.videoLimit) {
        return {
          allowed: false,
          reason: `You have reached your plan limit of ${subscription.plan.videoLimit} videos.`,
          subscription,
        };
      }
    }

    return { allowed: true, subscription };
  }
}
