import { Module } from '@nestjs/common';
import { VoiceAvatarService } from './voice-avatar.service';
import { VoiceAvatarController } from './voice-avatar.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, QueueModule, ConfigModule],
  providers: [VoiceAvatarService],
  controllers: [VoiceAvatarController],
  exports: [VoiceAvatarService],
})
export class VoiceAvatarModule {}
