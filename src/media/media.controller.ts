import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload/presigned')
  @ApiOperation({ summary: 'Get presigned URL for direct S3 upload' })
  async getPresignedUrl(
    @CurrentUser('id') userId: string,
    @Body() body: {
      fileName: string;
      contentType: string;
      fileSize: number;
      isBroll?: boolean;
    },
  ) {
    return this.mediaService.getPresignedUploadUrl(
      userId,
      body.fileName,
      body.contentType,
      body.fileSize,
      body.isBroll || false,
    );
  }

  @Post('upload/confirm')
  @ApiOperation({ summary: 'Confirm upload and register media file' })
  async confirmUpload(
    @CurrentUser('id') userId: string,
    @Body() body: {
      projectId: string;
      key: string;
      publicUrl: string;
      fileData: {
        originalName: string;
        mimeType: string;
        size: number;
        duration?: number;
        width?: number;
        height?: number;
      };
      isBroll?: boolean;
    },
  ) {
    return this.mediaService.confirmUpload(
      userId,
      body.projectId,
      body.key,
      body.publicUrl,
      body.fileData,
      body.isBroll || false,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all media files for a project' })
  async getProjectMedia(
    @CurrentUser('id') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.mediaService.getProjectMedia(projectId, userId);
  }

  @Delete(':mediaId')
  @ApiOperation({ summary: 'Delete a media file' })
  async deleteMedia(
    @CurrentUser('id') userId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.mediaService.deleteMediaFile(mediaId, userId);
  }

  @Get('google-drive/auth')
  @ApiOperation({ summary: 'Initiate Google Drive OAuth' })
  async initiateGoogleDriveAuth(@CurrentUser('id') userId: string) {
    return this.mediaService.initiateGoogleDriveAuth(userId);
  }

  @Post('google-drive/import')
  @ApiOperation({ summary: 'Import file from Google Drive' })
  async importFromGoogleDrive(
    @CurrentUser('id') userId: string,
    @Body() body: { driveFileId: string; projectId: string },
  ) {
    return this.mediaService.importFromGoogleDrive(userId, body.driveFileId, body.projectId);
  }

  @Get('stock-footage/search')
  @ApiOperation({ summary: 'Search stock footage' })
  async searchStockFootage(
    @Query('q') query: string,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return this.mediaService.searchStockFootage(query, page, perPage);
  }

  @Post('ai-broll/generate')
  @ApiOperation({ summary: 'Generate AI B-roll' })
  async generateAiBroll(
    @CurrentUser('id') userId: string,
    @Body() body: { projectId: string; prompt: string },
  ) {
    return this.mediaService.generateAiBroll(userId, body.projectId, body.prompt);
  }

  // B-roll Library Endpoints
  @Public()
  @Get('brolls/library')
  @ApiOperation({ summary: 'Get B-roll library with categories and items' })
  async getBrollLibrary() {
    return this.mediaService.getBrollLibrary();
  }
}
