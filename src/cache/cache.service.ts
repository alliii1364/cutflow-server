import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;
  private available = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis(this.configService.get('REDIS_URL') || 'redis://localhost:6379', {
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null, // don't retry — cache is best-effort
    });

    this.redis.connect().then(() => {
      this.available = true;
      this.logger.log('Cache connected to Redis');
    }).catch((err) => {
      this.logger.warn(`Cache unavailable — running without cache: ${err.message}`);
    });
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.available) return null;
    try {
      const val = await this.redis.get(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.available) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // cache write failure is non-fatal
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.available) return;
    try {
      await this.redis.del(...keys);
    } catch {}
  }
}
