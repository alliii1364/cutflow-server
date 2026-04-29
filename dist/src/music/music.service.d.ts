import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { StorageService } from '../storage/storage.service';
export declare class MusicService {
    private prisma;
    private queue;
    private storage;
    private configService;
    private openai;
    constructor(prisma: PrismaService, queue: QueueService, storage: StorageService, configService: ConfigService);
    generateMusic(userId: string, projectId: string, params: {
        style: 'CALM' | 'ENERGETIC' | 'CORPORATE' | 'EMOTIONAL' | 'UPBEAT' | 'EPIC';
        duration: number;
        mood?: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    detectMoodAndMatchMusic(userId: string, projectId: string): Promise<{
        detectedMood: string;
        jobId: string;
        status: string;
    }>;
    getBeatSyncTimestamps(musicTrackId: string, userId: string): Promise<{
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
    assignMusicToProject(userId: string, projectId: string, musicTrackId: string): Promise<{
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
