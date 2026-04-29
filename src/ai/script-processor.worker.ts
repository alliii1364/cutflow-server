import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScriptService, ScriptGenerationRequest } from './services/script.service';
import { QueueService } from '../queue/queue.service';

interface ScriptJobData {
  projectId: string;
  request: ScriptGenerationRequest;
}

@Injectable()
export class ScriptProcessorWorker implements OnModuleInit {
  private readonly logger = new Logger(ScriptProcessorWorker.name);

  constructor(
    private queue: QueueService,
    private scriptService: ScriptService,
  ) {}

  onModuleInit() {
    this.queue.createWorker<ScriptJobData>('scripts', async (job) => {
      await this.processScriptJob(job);
    });
    this.logger.log('Script processor worker initialized');
  }

  private async processScriptJob(job: Job<ScriptJobData>): Promise<void> {
    const { projectId, request } = job.data;

    this.logger.log(`Processing script job ${job.id} for project ${projectId}`);

    try {
      await job.updateProgress(10);

      await this.scriptService.processScriptGeneration({
        projectId,
        request,
      });

      await job.updateProgress(100);

      this.logger.log(`Script job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`Script job ${job.id} failed:`, error);
      throw error;
    }
  }
}
