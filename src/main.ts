import { config as loadEnv } from 'dotenv';
loadEnv();
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
  console.log(`🔐 CORS enabled for: ${origins.join(', ') || 'none'}`);
}
bootstrap();
