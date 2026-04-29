import { MusicService } from './music.service';
export declare class MusicController {
    private musicService;
    constructor(musicService: MusicService);
    generateMusic(userId: string, projectId: string, body: {
        style: 'CALM' | 'ENERGETIC' | 'CORPORATE' | 'EMOTIONAL' | 'UPBEAT' | 'EPIC';
        duration: number;
        mood?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    detectMoodAndMatch(userId: string, projectId: string): Promise<{
        detectedMood: string;
        jobId: string;
        status: string;
    }>;
    getBeatSyncTimestamps(userId: string, projectId: string): Promise<{
        status: string;
        jobId: string;
        message: string;
        beatTimestamps?: undefined;
    } | {
        status: string;
        beatTimestamps: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
        jobId?: undefined;
        message?: undefined;
    }>;
    assignMusic(userId: string, projectId: string, body: {
        musicTrackId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getProjectMusic(userId: string, projectId: string): Promise<{
        id: string;
        createdAt: Date;
        s3Key: string;
        s3Url: string;
        duration: number;
        style: import(".prisma/client").$Enums.MusicStyle;
        isAiGenerated: boolean;
        beatTimestamps: import("@prisma/client/runtime/library").JsonValue | null;
        moodTags: string[];
    }>;
}
