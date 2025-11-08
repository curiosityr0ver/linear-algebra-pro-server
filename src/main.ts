import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Linear Algebra Pro API')
    .setDescription('A comprehensive REST API for linear algebra operations, advanced algorithms, and machine learning')
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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 API Documentation available at http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
