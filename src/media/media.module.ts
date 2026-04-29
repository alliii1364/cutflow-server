import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { BrollsController } from './brolls.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [PrismaModule, StorageModule, SubscriptionsModule],
  providers: [MediaService],
  controllers: [MediaController, BrollsController],
  exports: [MediaService],
})
export class MediaModule {}
