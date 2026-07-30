import { Module } from '@nestjs/common';
import { SplitTestingService } from './split-testing.service';
import { SplitTestingController } from './split-testing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule],
  providers: [SplitTestingService],
  controllers: [SplitTestingController],
  exports: [SplitTestingService],
})
export class SplitTestingModule {}
