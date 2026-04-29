import { Module } from '@nestjs/common';
import { VisualAiService } from './visual-ai.service';
import { VisualAiController } from './visual-ai.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, QueueModule, ConfigModule],
  providers: [VisualAiService],
  controllers: [VisualAiController],
  exports: [VisualAiService],
})
export class VisualAiModule {}
