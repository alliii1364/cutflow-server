import { VoiceAvatarService } from './voice-avatar.service';
export declare class VoiceAvatarController {
    private voiceAvatarService;
    constructor(voiceAvatarService: VoiceAvatarService);
    getAvailableVoices(): Promise<{
        voices: {
            id: string;
            name: string;
            accent: string;
            gender: string;
            age: string;
        }[];
    }>;
    generateVoiceover(userId: string, projectId: string, body: {
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
    generateAvatar(userId: string, projectId: string, body: {
        avatarId: string;
        script?: string;
        voiceId?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    assignVoice(userId: string, projectId: string, body: {
        voiceTrackId: string;
    }): Promise<{
        success: boolean;
    }>;
}
