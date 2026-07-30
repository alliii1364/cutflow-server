import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CaptionService } from './services/caption.service';
import { QueueService } from '../queue/queue.service';

interface CaptionJobData {
  projectId: string;
  videoKey: string;
  language: string;
  style?: any;
}

@Injectable()
export class CaptionProcessorWorker implements OnModuleInit {
  private readonly logger = new Logger(CaptionProcessorWorker.name);

  constructor(
    private queue: QueueService,
    private captionService: CaptionService,
  ) {}

  onModuleInit() {
    this.queue.createWorker<CaptionJobData>('captions', async (job) => {
      await this.processCaptionJob(job);
    });
    this.logger.log('Caption processor worker initialized');
  }

  private async processCaptionJob(job: Job<CaptionJobData>): Promise<void> {
    const { projectId, videoKey, language, style } = job.data;

    this.logger.log(`Processing caption job ${job.id} for project ${projectId}`);

    try {
      await job.updateProgress(10);

      await this.captionService.processCaptionGeneration({
        projectId,
        videoKey,
        language,
        style,
      });

      await job.updateProgress(100);

      this.logger.log(`Caption job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Caption job ${job.id} failed:`, error);
      throw error;
    }
  }
}
