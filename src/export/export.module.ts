import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { VideoProcessorWorker } from './video-processor.worker';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, QueueModule, StorageModule],
  providers: [ExportService, VideoProcessorWorker],
  controllers: [ExportController],
  exports: [ExportService],
})
export class ExportModule {}
