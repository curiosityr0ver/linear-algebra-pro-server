import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MLController (e2e)', () => {
  let app: INestApplication;
  let trainedModelId: string | undefined;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    if (trainedModelId) {
      await request(app.getHttpServer())
        .delete(`/ml/models/${trainedModelId}`)
        .expect(200);
    }
    await app.close();
  });

  it('trains a linear regression model and returns metadata', async () => {
    const payload = {
      X: { data: [[1], [2], [3], [4]] },
      y: { data: [[3], [5], [7], [9]] },
      options: {
        learningRate: 0.05,
        maxIterations: 200,
        tolerance: 1e-6,
      },
      lossFunction: 'mse',
    };

    const response = await request(app.getHttpServer())
      .post('/ml/linear-regression/train')
      .send(payload)
      .expect(201);

    trainedModelId = response.body.modelId;
    expect(trainedModelId).toMatch(/^linear_regression_/);
    expect(response.body.result.loss_history.length).toBeGreaterThan(0);
    expect(typeof response.body.result.final_loss).toBe('number');
  });

  it('lists trained models with ISO timestamps', async () => {
    expect(trainedModelId).toBeDefined();
    const response = await request(app.getHttpServer())
      .get('/ml/models')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const modelEntry = response.body.find(
      (entry: { modelId: string }) => entry.modelId === trainedModelId,
    );
    expect(modelEntry).toBeDefined();
    expect(modelEntry.type).toBe('linear_regression');
    expect(modelEntry.created).not.toBe('Invalid Date');
    expect(Number.isNaN(new Date(modelEntry.created).getTime())).toBe(false);
    expect(modelEntry.optimizer).toBeDefined();
    expect(modelEntry.lossFunction).toBeDefined();
    expect(typeof modelEntry.iterations).toBe('number');
    expect(typeof modelEntry.final_loss).toBe('number');
    expect(typeof modelEntry.converged).toBe('boolean');
  });

  it('predicts with the trained model', async () => {
    expect(trainedModelId).toBeDefined();
    const modelId = trainedModelId as string;
    const payload = {
      X: { data: [[5], [6]] },
    };

    const response = await request(app.getHttpServer())
      .post(`/ml/linear-regression/${modelId}/predict`)
      .send(payload)
      .expect(201);

    expect(response.body.predictions.data.length).toBe(2);
    expect(response.body.predictions.cols).toBe(1);
  });

  it('returns 404 when predicting with an unknown model', async () => {
    const payload = {
      X: { data: [[1], [2]] },
    };

    const response = await request(app.getHttpServer())
      .post('/ml/linear-regression/linear_regression_unknown/predict')
      .send(payload)
      .expect(404);

    expect(response.body.message).toContain('Model with ID');
  });

  it('returns 400 when training data shapes do not align', async () => {
    const payload = {
      X: { data: [[1], [2]] },
      y: { data: [[2], [4], [6]] },
      lossFunction: 'mse',
    };

    const response = await request(app.getHttpServer())
      .post('/ml/linear-regression/train')
      .send(payload)
      .expect(400);

    expect(response.body.message).toContain(
      'Shape mismatch between true and predicted values',
    );
  });

  it('retrieves model metadata by id', async () => {
    expect(trainedModelId).toBeDefined();
    const modelId = trainedModelId as string;
    const response = await request(app.getHttpServer())
      .get(`/ml/models/${modelId}`)
      .expect(200);

    expect(response.body.modelId).toBe(trainedModelId);
    expect(response.body.type).toBe('linear_regression');
    expect(response.body.created).not.toBe('Invalid Date');
    expect(response.body.weights).toBeDefined();
    expect(response.body.bias).toBeDefined();
    expect(response.body.training).toBeDefined();
    expect(response.body.training.loss_history.length).toBeGreaterThan(0);
    expect(typeof response.body.training.final_loss).toBe('number');
    expect(typeof response.body.training.iterations).toBe('number');
  });

  it('returns training history for a model', async () => {
    expect(trainedModelId).toBeDefined();
    const modelId = trainedModelId as string;

    const response = await request(app.getHttpServer())
      .get(`/ml/models/${modelId}/history`)
      .expect(200);

    expect(response.body.modelId).toBe(modelId);
    expect(Array.isArray(response.body.loss_history)).toBe(true);
    expect(response.body.loss_history.length).toBeGreaterThan(0);
    expect(typeof response.body.iterations).toBe('number');
    expect(typeof response.body.final_loss).toBe('number');
    expect(response.body.lossFunction).toBeDefined();
    expect(response.body.optimizer).toBeDefined();
  });
});

