import { ConfigService } from '@nestjs/config';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
export declare class StorageService {
    private configService;
    private s3Client;
    private bucketName;
    private publicUrlBase;
    private isR2;
    constructor(configService: ConfigService);
    generatePresignedUploadUrl(folder: string, fileName: string, contentType: string, expiresIn?: number): Promise<{
        uploadUrl: string;
        key: string;
        publicUrl: string;
    }>;
    generatePresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    getFileStream(key: string): Promise<GetObjectCommandOutput>;
    getPublicUrl(key: string): string;
    downloadFile(key: string, localPath: string): Promise<void>;
    uploadFile(localPath: string, key: string, contentType: string): Promise<void>;
    getFileUrl(key: string): Promise<string>;
}
