import { Module } from '@nestjs/common';
import { AiEditingService } from './ai-editing.service';
import { AiEditingController } from './ai-editing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [PrismaModule, QueueModule, VideosModule],
  providers: [AiEditingService],
  controllers: [AiEditingController],
  exports: [AiEditingService],
})
export class AiEditingModule {}
