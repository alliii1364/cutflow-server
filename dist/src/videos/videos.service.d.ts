import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { VideoStatus } from '@prisma/client';
export declare class VideosService {
    private prisma;
    private subscriptionsService;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService);
    createProject(userId: string, data: {
        title: string;
        description?: string;
        aspectRatio?: string;
    }): Promise<{
        mediaFiles: {
            id: string;
            duration: number | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            projectId: string;
            type: import(".prisma/client").$Enums.MediaType;
            originalName: string;
            s3Key: string;
            s3Url: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            isPrimary: boolean;
            timelinePosition: number | null;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.VideoStatus;
        aspectRatio: string;
        duration: number | null;
        thumbnailUrl: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        musicTrackId: string | null;
        voiceTrackId: string | null;
    }>;
    getUserProjects(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            mediaFiles: {
                id: string;
                duration: number | null;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                projectId: string;
                type: import(".prisma/client").$Enums.MediaType;
                originalName: string;
                s3Key: string;
                s3Url: string;
                mimeType: string;
                size: number;
                width: number | null;
                height: number | null;
                isPrimary: boolean;
                timelinePosition: number | null;
            }[];
            _count: {
                mediaFiles: number;
            };
        } & {
            id: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.VideoStatus;
            aspectRatio: string;
            duration: number | null;
            thumbnailUrl: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
            isDeleted: boolean;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            musicTrackId: string | null;
            voiceTrackId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProject(userId: string, projectId: string): Promise<{
        mediaFiles: {
            id: string;
            duration: number | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            projectId: string;
            type: import(".prisma/client").$Enums.MediaType;
            originalName: string;
            s3Key: string;
            s3Url: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            isPrimary: boolean;
            timelinePosition: number | null;
        }[];
        exports: {
            id: string;
            status: import(".prisma/client").$Enums.JobStatus;
            duration: number | null;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            s3Key: string | null;
            s3Url: string | null;
            resolution: import(".prisma/client").$Enums.ExportResolution;
            platform: import(".prisma/client").$Enums.Platform | null;
            fileSize: number | null;
            progress: number;
            errorMessage: string | null;
            renderStartedAt: Date | null;
            renderCompletedAt: Date | null;
            expiresAt: Date | null;
            downloadCount: number;
            lastDownloadedAt: Date | null;
        }[];
        caption: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            language: string;
            segments: import("@prisma/client/runtime/library").JsonValue;
            style: import("@prisma/client/runtime/library").JsonValue;
            keywords: string[];
            isAnimated: boolean;
            wordHighlighting: boolean;
            confidence: number | null;
        };
        aiScript: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            sourceType: string;
            sourceContent: string | null;
            tone: string;
            generatedScript: string;
            hookVariants: import("@prisma/client/runtime/library").JsonValue;
            selectedHookIndex: number;
            wordCount: number | null;
            estimatedDuration: number | null;
        };
        templateApplication: {
            template: {
                id: string;
                description: string | null;
                thumbnailUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                style: string | null;
                estimatedDuration: number | null;
                category: string;
                tier: import(".prisma/client").$Enums.TemplateTier;
                previewUrl: string | null;
                config: import("@prisma/client/runtime/library").JsonValue;
                aspectRatios: string[];
                tags: string[];
                industry: string | null;
                isActive: boolean;
                sortOrder: number;
            };
        } & {
            id: string;
            createdAt: Date;
            projectId: string;
            templateId: string;
            appliedConfig: import("@prisma/client/runtime/library").JsonValue;
        };
        processingJobs: {
            id: string;
            status: import(".prisma/client").$Enums.JobStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            progress: number;
            errorMessage: string | null;
            jobType: string;
            inputData: import("@prisma/client/runtime/library").JsonValue;
            outputData: import("@prisma/client/runtime/library").JsonValue;
            startedAt: Date | null;
            completedAt: Date | null;
            bullJobId: string | null;
        }[];
        musicTrack: {
            id: string;
            duration: number;
            createdAt: Date;
            s3Key: string;
            s3Url: string;
            style: import(".prisma/client").$Enums.MusicStyle;
            isAiGenerated: boolean;
            beatTimestamps: import("@prisma/client/runtime/library").JsonValue | null;
            moodTags: string[];
        };
        voiceTrack: {
            id: string;
            duration: number;
            createdAt: Date;
            s3Key: string;
            s3Url: string;
            voiceId: string;
            voiceName: string;
            transcript: string;
            accent: string | null;
            gender: string | null;
            age: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.VideoStatus;
        aspectRatio: string;
        duration: number | null;
        thumbnailUrl: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        musicTrackId: string | null;
        voiceTrackId: string | null;
    }>;
    updateProject(userId: string, projectId: string, data: {
        title?: string;
        description?: string;
        aspectRatio?: string;
    }): Promise<{
        mediaFiles: {
            id: string;
            duration: number | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            projectId: string;
            type: import(".prisma/client").$Enums.MediaType;
            originalName: string;
            s3Key: string;
            s3Url: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            isPrimary: boolean;
            timelinePosition: number | null;
        }[];
        caption: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            language: string;
            segments: import("@prisma/client/runtime/library").JsonValue;
            style: import("@prisma/client/runtime/library").JsonValue;
            keywords: string[];
            isAnimated: boolean;
            wordHighlighting: boolean;
            confidence: number | null;
        };
        aiScript: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            sourceType: string;
            sourceContent: string | null;
            tone: string;
            generatedScript: string;
            hookVariants: import("@prisma/client/runtime/library").JsonValue;
            selectedHookIndex: number;
            wordCount: number | null;
            estimatedDuration: number | null;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.VideoStatus;
        aspectRatio: string;
        duration: number | null;
        thumbnailUrl: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        musicTrackId: string | null;
        voiceTrackId: string | null;
    }>;
    deleteProject(userId: string, projectId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProjectStatus(userId: string, projectId: string, status: VideoStatus): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.VideoStatus;
        aspectRatio: string;
        duration: number | null;
        thumbnailUrl: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        musicTrackId: string | null;
        voiceTrackId: string | null;
    }>;
    updateAiEdits(userId: string, projectId: string, editData: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.VideoStatus;
        aspectRatio: string;
        duration: number | null;
        thumbnailUrl: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        aiEditsApplied: import("@prisma/client/runtime/library").JsonValue;
        isDeleted: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        musicTrackId: string | null;
        voiceTrackId: string | null;
    }>;
    getProjectStatus(userId: string, projectId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.VideoStatus;
        processingJobs: {
            id: string;
            status: import(".prisma/client").$Enums.JobStatus;
            progress: number;
            jobType: string;
        }[];
    }>;
    saveProjectState(userId: string, projectId: string, data: {
        state: Record<string, any>;
        thumbnailUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
        version: number;
        savedAt: string;
    }>;
    loadProjectState(userId: string, projectId: string): Promise<{
        project: {
            id: string;
            title: string;
            description: string;
            aspectRatio: string;
            duration: number;
            thumbnailUrl: string;
            status: import(".prisma/client").$Enums.VideoStatus;
            createdAt: Date;
            updatedAt: Date;
            mediaFiles: {
                id: string;
                duration: number | null;
                metadata: import("@prisma/client/runtime/library").JsonValue;
                createdAt: Date;
                projectId: string;
                type: import(".prisma/client").$Enums.MediaType;
                originalName: string;
                s3Key: string;
                s3Url: string;
                mimeType: string;
                size: number;
                width: number | null;
                height: number | null;
                isPrimary: boolean;
                timelinePosition: number | null;
            }[];
            caption: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                language: string;
                segments: import("@prisma/client/runtime/library").JsonValue;
                style: import("@prisma/client/runtime/library").JsonValue;
                keywords: string[];
                isAnimated: boolean;
                wordHighlighting: boolean;
                confidence: number | null;
            };
            aiScript: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
                sourceType: string;
                sourceContent: string | null;
                tone: string;
                generatedScript: string;
                hookVariants: import("@prisma/client/runtime/library").JsonValue;
                selectedHookIndex: number;
                wordCount: number | null;
                estimatedDuration: number | null;
            };
            musicTrack: {
                id: string;
                duration: number;
                createdAt: Date;
                s3Key: string;
                s3Url: string;
                style: import(".prisma/client").$Enums.MusicStyle;
                isAiGenerated: boolean;
                beatTimestamps: import("@prisma/client/runtime/library").JsonValue | null;
                moodTags: string[];
            };
            voiceTrack: {
                id: string;
                duration: number;
                createdAt: Date;
                s3Key: string;
                s3Url: string;
                voiceId: string;
                voiceName: string;
                transcript: string;
                accent: string | null;
                gender: string | null;
                age: string | null;
            };
        };
        state: Record<string, any>;
        version: number;
        lastSaved: Date;
    }>;
    exportProjectState(userId: string, projectId: string): Promise<{
        success: boolean;
        data: {
            project: {
                id: string;
                title: string;
                description: string;
                aspectRatio: string;
                duration: number;
                thumbnailUrl: string;
                status: import(".prisma/client").$Enums.VideoStatus;
                createdAt: Date;
                updatedAt: Date;
                mediaFiles: {
                    id: string;
                    duration: number | null;
                    metadata: import("@prisma/client/runtime/library").JsonValue;
                    createdAt: Date;
                    projectId: string;
                    type: import(".prisma/client").$Enums.MediaType;
                    originalName: string;
                    s3Key: string;
                    s3Url: string;
                    mimeType: string;
                    size: number;
                    width: number | null;
                    height: number | null;
                    isPrimary: boolean;
                    timelinePosition: number | null;
                }[];
                caption: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    projectId: string;
                    language: string;
                    segments: import("@prisma/client/runtime/library").JsonValue;
                    style: import("@prisma/client/runtime/library").JsonValue;
                    keywords: string[];
                    isAnimated: boolean;
                    wordHighlighting: boolean;
                    confidence: number | null;
                };
                aiScript: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    projectId: string;
                    sourceType: string;
                    sourceContent: string | null;
                    tone: string;
                    generatedScript: string;
                    hookVariants: import("@prisma/client/runtime/library").JsonValue;
                    selectedHookIndex: number;
                    wordCount: number | null;
                    estimatedDuration: number | null;
                };
                musicTrack: {
                    id: string;
                    duration: number;
                    createdAt: Date;
                    s3Key: string;
                    s3Url: string;
                    style: import(".prisma/client").$Enums.MusicStyle;
                    isAiGenerated: boolean;
                    beatTimestamps: import("@prisma/client/runtime/library").JsonValue | null;
                    moodTags: string[];
                };
                voiceTrack: {
                    id: string;
                    duration: number;
                    createdAt: Date;
                    s3Key: string;
                    s3Url: string;
                    voiceId: string;
                    voiceName: string;
                    transcript: string;
                    accent: string | null;
                    gender: string | null;
                    age: string | null;
                };
            };
            state: Record<string, any>;
            version: number;
            lastSaved: Date;
        };
        exportFormat: string;
        exportedAt: string;
    }>;
    startExport(userId: string, projectId: string, data: {
        resolution: 'P720' | 'P1080' | 'P4K';
        platform?: string;
    }): Promise<{
        exportId: string;
        status: string;
        message: string;
    }>;
    getProjectExports(userId: string, projectId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.JobStatus;
        duration: number | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        s3Key: string | null;
        s3Url: string | null;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        progress: number;
        errorMessage: string | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        expiresAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }[]>;
    getExportStatus(userId: string, exportId: string): Promise<{
        project: {
            title: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.JobStatus;
        duration: number | null;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        s3Key: string | null;
        s3Url: string | null;
        resolution: import(".prisma/client").$Enums.ExportResolution;
        platform: import(".prisma/client").$Enums.Platform | null;
        fileSize: number | null;
        progress: number;
        errorMessage: string | null;
        renderStartedAt: Date | null;
        renderCompletedAt: Date | null;
        expiresAt: Date | null;
        downloadCount: number;
        lastDownloadedAt: Date | null;
    }>;
    getExportDownloadUrl(userId: string, exportId: string): Promise<{
        downloadUrl: string;
        expiresIn: number;
    }>;
}
