import { BadRequestException } from '@nestjs/common';
import { AdvancedService } from './advanced.service';
import { Matrix, PCA } from '../lib';

describe('AdvancedService - PCA integration', () => {
  let service: AdvancedService;

  const trainingPayload = {
    X: {
      data: [
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
        [5, 10]
      ]
    },
    nComponents: 1
  };

  beforeEach(() => {
    service = new AdvancedService();
  });

  it('should return mean metadata when training PCA', () => {
    const result = service.performPCA(trainingPayload);

    expect(result.mean).toBeDefined();
    expect(result.mean.rows).toBe(1);
    expect(result.mean.cols).toBe(2);
    expect(result.mean.data[0][0]).toBeCloseTo(3, 5);
    expect(result.mean.data[0][1]).toBeCloseTo(6, 5);
  });

  it('should reuse stored mean and components during transform', () => {
    const trained = service.performPCA(trainingPayload);
    const transformPayload = {
      X: {
        data: [
          [6, 12],
          [7, 14]
        ]
      }
    };

    const transformed = service.transformWithPCA(transformPayload, trained);

    expect(transformed.X_transformed.rows).toBe(2);
    expect(transformed.X_transformed.cols).toBe(trained.n_components);

    const referencePca = new PCA();
    referencePca.fit(new Matrix(trainingPayload.X.data), trained.n_components);
    const expected = referencePca.transform(new Matrix(transformPayload.X.data));

    for (let i = 0; i < expected.rows; i++) {
      for (let j = 0; j < expected.cols; j++) {
        expect(transformed.X_transformed.data[i][j]).toBeCloseTo(expected.get(i, j), 5);
      }
    }
  });

  it('should throw when mean metadata is missing during transform', () => {
    const trained = service.performPCA(trainingPayload);
    const transformPayload = {
      X: {
        data: [
          [6, 12]
        ]
      }
    };

    expect(() =>
      service.transformWithPCA(transformPayload, { ...trained, mean: undefined as any })
    ).toThrow(BadRequestException);
  });
});

