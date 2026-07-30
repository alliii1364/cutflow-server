import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { StorageModule } from '../storage/storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, QueueModule, StorageModule, ConfigModule],
  providers: [MusicService],
  controllers: [MusicController],
  exports: [MusicService],
})
export class MusicModule {}
