import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(compression());

  // Enable CORS
  // FRONTEND_URL accepts a comma-separated list of exact origins.
  // All *.vercel.app subdomains are also permitted to support preview deployments.
  const rawOrigin = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  const allowedOrigins = new Set(rawOrigin.split(',').map((o) => o.trim()));

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow exact matches from FRONTEND_URL list
      if (allowedOrigins.has(origin)) return callback(null, true);
      // Allow any Vercel preview deployment
      if (/^https:\/\/[a-z0-9-]+(\.vercel\.app)$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const port = configService.get('PORT') || 3000;

  // Swagger documentation (dev only)
  if (configService.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CutFlow API')
      .setDescription('AI Video Creation Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  if (configService.get('NODE_ENV') !== 'production') {
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
