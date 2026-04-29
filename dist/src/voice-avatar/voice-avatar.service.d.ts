import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class VoiceAvatarService {
    private prisma;
    private queue;
    private configService;
    constructor(prisma: PrismaService, queue: QueueService, configService: ConfigService);
    getAvailableVoices(): Promise<{
        voices: {
            id: string;
            name: string;
            accent: string;
            gender: string;
            age: string;
        }[];
    }>;
    generateVoiceover(userId: string, projectId: string, params: {
        script?: string;
        voiceId: string;
        voiceName: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    getAvatarOptions(): Promise<{
        avatars: {
            id: string;
            name: string;
            style: string;
        }[];
    }>;
    generateAvatar(userId: string, projectId: string, params: {
        avatarId: string;
        script?: string;
        voiceId?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    assignVoiceToProject(userId: string, projectId: string, voiceTrackId: string): Promise<{
        success: boolean;
    }>;
}
