import { Module } from '@nestjs/common';
import { ExtrasService } from './extras.service';
import { ExtrasController } from './extras.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, QueueModule, StorageModule, ConfigModule],
  providers: [ExtrasService],
  controllers: [ExtrasController],
  exports: [ExtrasService],
})
export class ExtrasModule {}
