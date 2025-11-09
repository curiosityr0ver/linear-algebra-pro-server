import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MatrixController (e2e)', () => {
  let app: INestApplication;

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
    await app.close();
  });

  describe('POST /matrix/add', () => {
    it('returns the element-wise sum when matrices share the same shape', async () => {
      const payload = {
        matrixA: { data: [[1, 2], [3, 4]] },
        matrixB: { data: [[5, 6], [7, 8]] },
      };

      const response = await request(app.getHttpServer())
        .post('/matrix/add')
        .send(payload)
        .expect(201);

      expect(response.body.metadata.operation).toBe('add');
      expect(response.body.result.data).toEqual([
        [6, 8],
        [10, 12],
      ]);
    });

    it('returns 400 when matrix shapes are incompatible', async () => {
      const payload = {
        matrixA: { data: [[1, 2], [3, 4]] },
        matrixB: { data: [[1, 2, 3]] },
      };

      const response = await request(app.getHttpServer())
        .post('/matrix/add')
        .send(payload)
        .expect(400);

      expect(response.body.message).toContain('Cannot add matrices');
    });

    it('returns 400 when matrixB is missing', async () => {
      const payload = {
        matrixA: { data: [[1, 2], [3, 4]] },
      };

      const response = await request(app.getHttpServer())
        .post('/matrix/add')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe(
        'Second matrix (matrixB) is required for addition',
      );
    });
  });

  describe('POST /matrix/determinant', () => {
    it('returns 400 when the matrix is not square', async () => {
      const payload = {
        matrix: {
          data: [
            [1, 2, 3],
            [4, 5, 6],
          ],
        },
      };

      const response = await request(app.getHttpServer())
        .post('/matrix/determinant')
        .send(payload)
        .expect(400);

      expect(response.body.message).toContain(
        'Determinant is only defined for square matrices',
      );
    });
  });
});

