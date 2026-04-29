"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const storage_module_1 = require("./storage/storage.module");
const queue_module_1 = require("./queue/queue.module");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const media_module_1 = require("./media/media.module");
const videos_module_1 = require("./videos/videos.module");
const ai_editing_module_1 = require("./ai-editing/ai-editing.module");
const captions_module_1 = require("./captions/captions.module");
const scripts_module_1 = require("./scripts/scripts.module");
const music_module_1 = require("./music/music.module");
const voice_avatar_module_1 = require("./voice-avatar/voice-avatar.module");
const visual_ai_module_1 = require("./visual-ai/visual-ai.module");
const export_module_1 = require("./export/export.module");
const templates_module_1 = require("./templates/templates.module");
const split_testing_module_1 = require("./split-testing/split-testing.module");
const admin_module_1 = require("./admin/admin.module");
const analytics_module_1 = require("./analytics/analytics.module");
const notifications_module_1 = require("./notifications/notifications.module");
const extras_module_1 = require("./extras/extras.module");
const ai_module_1 = require("./ai/ai.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            storage_module_1.StorageModule,
            queue_module_1.QueueModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            subscriptions_module_1.SubscriptionsModule,
            media_module_1.MediaModule,
            videos_module_1.VideosModule,
            ai_editing_module_1.AiEditingModule,
            captions_module_1.CaptionsModule,
            scripts_module_1.ScriptsModule,
            music_module_1.MusicModule,
            voice_avatar_module_1.VoiceAvatarModule,
            visual_ai_module_1.VisualAiModule,
            export_module_1.ExportModule,
            templates_module_1.TemplatesModule,
            split_testing_module_1.SplitTestingModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
            extras_module_1.ExtrasModule,
            ai_module_1.AIModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map