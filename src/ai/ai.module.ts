import { Module } from '@nestjs/common';
import { CaptionService } from './services/caption.service';
import { CaptionProcessorWorker } from './caption-processor.worker';
import { ScriptService } from './services/script.service';
import { ScriptProcessorWorker } from './script-processor.worker';
import { AIController } from './controllers/ai.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, QueueModule, StorageModule],
  providers: [
    CaptionService,
    CaptionProcessorWorker,
    ScriptService,
    ScriptProcessorWorker,
  ],
  controllers: [AIController],
  exports: [CaptionService, ScriptService],
})
export class AIModule {}
