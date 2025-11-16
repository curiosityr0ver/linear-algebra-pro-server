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

  // Patch ExpressAdapter to avoid 'app.router' deprecation error
  // Express 4.x throws an error when accessing app.router, but NestJS still checks for it
  // We need to patch the ExpressAdapter's isMiddlewareApplied method before creating the adapter
  const ExpressAdapterPrototype = ExpressAdapter.prototype as any;
  if (ExpressAdapterPrototype && ExpressAdapterPrototype.isMiddlewareApplied) {
    const originalIsMiddlewareApplied = ExpressAdapterPrototype.isMiddlewareApplied;
    ExpressAdapterPrototype.isMiddlewareApplied = function(middleware: any) {
      try {
        return originalIsMiddlewareApplied.call(this, middleware);
      } catch (error: any) {
        // If accessing app.router throws (Express 4.x), assume middleware is not applied
        if (error && error.message && error.message.includes('app.router')) {
          return false;
        }
        throw error;
      }
    };
  }

  const expressApp = express();
  
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter, {
    logger: false,
  });

  // Enable CORS for configured origins
  // Default to localhost for development; production should set CLIENT_ORIGIN env var
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
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js',
    ],
    customfavIcon: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/favicon-32x32.png',
    customSiteTitle: 'Linear Algebra Pro API',
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

