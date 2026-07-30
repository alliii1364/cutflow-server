import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { QueueModule } from './queue/queue.module';
import { HealthModule } from './health/health.module';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MediaModule } from './media/media.module';
import { VideosModule } from './videos/videos.module';
import { AiEditingModule } from './ai-editing/ai-editing.module';
import { CaptionsModule } from './captions/captions.module';
import { ScriptsModule } from './scripts/scripts.module';
import { MusicModule } from './music/music.module';
import { VoiceAvatarModule } from './voice-avatar/voice-avatar.module';
import { VisualAiModule } from './visual-ai/visual-ai.module';
import { ExportModule } from './export/export.module';
import { TemplatesModule } from './templates/templates.module';
import { SplitTestingModule } from './split-testing/split-testing.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExtrasModule } from './extras/extras.module';
import { AIModule } from './ai/ai.module';

// Guards and Interceptors
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    PrismaModule,
    StorageModule,
    QueueModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    MediaModule,
    VideosModule,
    AiEditingModule,
    CaptionsModule,
    ScriptsModule,
    MusicModule,
    VoiceAvatarModule,
    VisualAiModule,
    ExportModule,
    TemplatesModule,
    SplitTestingModule,
    AdminModule,
    AnalyticsModule,
    NotificationsModule,
    ExtrasModule,
    AIModule,
  ],
  providers: [
    // Global JWT guard (with Public decorator support)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
