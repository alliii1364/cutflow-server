import { Module } from '@nestjs/common';
import { CaptionsService } from './captions.service';
import { CaptionsController } from './captions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, QueueModule, ConfigModule],
  providers: [CaptionsService],
  controllers: [CaptionsController],
  exports: [CaptionsService],
})
export class CaptionsModule {}
