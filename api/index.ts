import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';

let cachedApp: INestApplication;

async function createApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  
  // Patch Express app to avoid 'app.router' deprecation error
  // Express 4.x throws an error when accessing app.router, but NestJS still checks for it
  // Override the router getter to return a mock router object instead of throwing
  Object.defineProperty(expressApp, 'router', {
    get: function() {
      return {
        stack: [],
      };
    },
    configurable: true,
  });
  
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: false,
  });

  // Enable CORS for configured origins
  const rawOrigins = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Linear Algebra Pro API')
    .setDescription(
      'A comprehensive REST API for linear algebra operations, advanced algorithms, and machine learning',
    )
    .setVersion('1.0')
    .addTag('Matrix Operations', 'Basic matrix arithmetic and operations')
    .addTag('Advanced Algorithms', 'PCA, SVD, and QR decomposition')
    .addTag('Machine Learning', 'Gradient descent and linear regression')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.init();
  cachedApp = app;
  return cachedApp;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await createApp();
    const expressInstance = app.getHttpAdapter().getInstance();
    expressInstance(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

