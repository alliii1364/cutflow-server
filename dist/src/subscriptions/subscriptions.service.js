"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const Stripe = require('stripe');
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.stripe = Stripe(this.configService.get('STRIPE_SECRET_KEY') || '');
    }
    async getPlans() {
        return this.prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getUserSubscription(userId) {
        return this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
    }
    async createCheckoutSession(userId, planId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const plan = await this.prisma.plan.findUnique({
            where: { id: planId },
        });
        if (!plan || !plan.stripePriceId) {
            throw new common_1.NotFoundException('Plan not found or not available for purchase');
        }
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
    async createBillingPortalSession(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription?.stripeCustomerId) {
            throw new common_1.BadRequestException('No active subscription found');
        }
        const session = await this.stripe.billingPortal.sessions.create({
            customer: subscription.stripeCustomerId,
            return_url: `${this.configService.get('FRONTEND_URL')}/billing`,
        });
        return { url: session.url };
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
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
    async handleCheckoutCompleted(session) {
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId)
            return;
        await this.prisma.subscription.update({
            where: { userId },
            data: {
                planId,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
    }
    async handlePaymentSucceeded(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        const subscription = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
        });
        if (!subscription)
            return;
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'ACTIVE',
                currentPeriodEnd: new Date((invoice.period_end || Date.now()) * 1000),
            },
        });
    }
    async handlePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        if (!subscriptionId)
            return;
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'PAST_DUE' },
        });
    }
    async handleSubscriptionCanceled(stripeSubscription) {
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: stripeSubscription.id },
            data: { status: 'CANCELED', canceledAt: new Date() },
        });
    }
    async checkVideoCreationAllowed(userId) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!subscription) {
            return { allowed: false, reason: 'No subscription found', subscription: null };
        }
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
        if (subscription.plan.tier !== 'FREE' && subscription.status !== 'ACTIVE') {
            return {
                allowed: false,
                reason: 'Subscription is not active. Please renew your subscription.',
                subscription,
            };
        }
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map