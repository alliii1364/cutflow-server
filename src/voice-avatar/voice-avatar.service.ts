import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

// ElevenLabs SDK would be imported here
// import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

@Injectable()
export class VoiceAvatarService {
  // private elevenLabs: ElevenLabsClient;

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private configService: ConfigService,
  ) {
    // this.elevenLabs = new ElevenLabsClient({
    //   apiKey: this.configService.get('ELEVENLABS_API_KEY') || '',
    // });
  }

  async getAvailableVoices() {
    // Mock response - would call ElevenLabs API
    return {
      voices: [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'Female', age: 'Young' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', accent: 'American', gender: 'Female', age: 'Young' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', accent: 'American', gender: 'Female', age: 'Young' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', accent: 'American', gender: 'Male', age: 'Young' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', accent: 'American', gender: 'Female', age: 'Young' },
        { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American', gender: 'Male', age: 'Young' },
        { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', accent: 'American', gender: 'Male', age: 'Old' },
        { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', accent: 'American', gender: 'Male', age: 'Middle' },
      ],
    };
  }

  async generateVoiceover(
    userId: string,
    projectId: string,
    params: {
      script?: string;
      voiceId: string;
      voiceName: string;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true, voiceTrack: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check AI voice permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiVoice) {
      throw new Error('AI voice generation not available on your plan');
    }

    const script = params.script || project.aiScript?.generatedScript;
    if (!script) {
      throw new NotFoundException('No script found. Generate a script first.');
    }

    // Create processing job
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'voice_generation',
        status: 'PENDING',
        inputData: {
          script,
          voiceId: params.voiceId,
          voiceName: params.voiceName,
        },
      },
    });

    await this.queue.addJob('voice', 'generate', {
      jobId: job.id,
      projectId,
      script,
      voiceId: params.voiceId,
      voiceName: params.voiceName,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async getAvatarOptions() {
    return {
      avatars: [
        { id: 'professional_female', name: 'Professional Female', style: 'business' },
        { id: 'casual_male', name: 'Casual Male', style: 'casual' },
        { id: 'young_creator', name: 'Young Creator', style: 'trendy' },
        { id: 'expert_professor', name: 'Expert Professor', style: 'educational' },
        { id: 'friendly_host', name: 'Friendly Host', style: 'friendly' },
      ],
    };
  }

  async generateAvatar(
    userId: string,
    projectId: string,
    params: {
      avatarId: string;
      script?: string;
      voiceId?: string;
    },
  ) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
      include: { aiScript: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check AI avatar permission
    const metadata = project.metadata as any;
    if (!metadata?.allowedFeatures?.aiAvatar) {
      throw new Error('AI avatar generation not available on your plan');
    }

    const script = params.script || project.aiScript?.generatedScript;
    if (!script) {
      throw new NotFoundException('No script found. Generate a script first.');
    }

    // Create processing job for avatar generation via Replicate
    const job = await this.prisma.processingJob.create({
      data: {
        projectId,
        jobType: 'avatar_generation',
        status: 'PENDING',
        inputData: {
          avatarId: params.avatarId,
          script,
          voiceId: params.voiceId,
        },
      },
    });

    await this.queue.addJob('avatar', 'generate', {
      jobId: job.id,
      projectId,
      avatarId: params.avatarId,
      script,
      voiceId: params.voiceId,
    });

    return { jobId: job.id, status: 'QUEUED' };
  }

  async assignVoiceToProject(userId: string, projectId: string, voiceTrackId: string) {
    const project = await this.prisma.videoProject.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.videoProject.update({
      where: { id: projectId },
      data: { voiceTrackId },
    });

    return { success: true };
  }
}
