import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const result = await this.subscriptionsService.checkVideoCreationAllowed(userId);

    if (!result.allowed) {
      throw new ForbiddenException(result.reason || 'Subscription required');
    }

    // Attach subscription info to request
    request.subscription = result.subscription;

    return true;
  }
}
