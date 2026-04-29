import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';
export declare class SubscriptionGuard implements CanActivate {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
