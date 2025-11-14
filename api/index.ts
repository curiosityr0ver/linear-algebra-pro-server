import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
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
  cachedApp = expressApp;
  return cachedApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await createApp();
  app(req, res);
}

