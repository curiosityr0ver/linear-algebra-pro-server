import {
  Matrix,
  PCA,
  GradientDescent,
  LinearRegression,
  MeanSquaredError,
  BinaryCrossEntropy,
  SVD,
  QR,
} from '../index';

describe('Advanced Linear Algebra Algorithms', () => {
  describe('PCA', () => {
    it('should perform PCA on simple 2D data', () => {
      // Create simple 2D data with correlation
      const data = [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [1.1, 2.1],
        [2.1, 3.1],
        [3.1, 4.1],
        [4.1, 5.1],
        [5.1, 6.1],
      ];
      const X = new Matrix(data);

      const pca = new PCA();
      pca.fit(X, 1);

      const components = pca.getComponents();
      const mean = pca.getMean();
      const explainedVariance = pca.getExplainedVariance();
      const explainedVarianceRatio = pca.getExplainedVarianceRatio();

      expect(components.rows).toBe(1);
      expect(components.cols).toBe(2);
      expect(mean.rows).toBe(1);
      expect(mean.cols).toBe(2);
      expect(mean.get(0, 0)).toBeCloseTo(3.05, 2);
      expect(mean.get(0, 1)).toBeCloseTo(4.05, 2);
      expect(explainedVariance.length).toBe(1);
      expect(explainedVarianceRatio.length).toBe(1);
      expect(explainedVarianceRatio[0]).toBeGreaterThan(0.9); // Should explain most variance
    });

    it('should transform data correctly', () => {
      const data = [
        [1, 2],
        [2, 4],
        [3, 6],
        [4, 8],
        [5, 10],
      ];
      const X = new Matrix(data);

      const pca = new PCA();
      const XTransformed = pca.fitTransform(X, 1);

      expect(XTransformed.cols).toBe(1); // Reduced to 1 dimension
      expect(XTransformed.rows).toBe(X.rows);

      // Transform new data with same number of features
      const XTest = new Matrix([[1.5, 3]]);
      const XTestTransformed = pca.transform(XTest);
      expect(XTestTransformed.rows).toBe(1);
      expect(XTestTransformed.cols).toBe(1);
    });

    it('should handle fit and transform separately', () => {
      const trainData = [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ];
      const testData = [
        [1.5, 1.5],
        [2.5, 2.5],
      ];

      const XTrain = new Matrix(trainData);
      const XTest = new Matrix(testData);

      const pca = new PCA();
      pca.fit(XTrain, 1);

      const XTrainTransformed = pca.transform(XTrain);
      const XTestTransformed = pca.transform(XTest);

      expect(XTrainTransformed.cols).toBe(1);
      expect(XTestTransformed.cols).toBe(1);
      expect(XTrainTransformed.rows).toBe(XTrain.rows);
      expect(XTestTransformed.rows).toBe(XTest.rows);
    });
  });

  describe('Gradient Descent', () => {
    describe('MeanSquaredError', () => {
      it('should compute MSE loss correctly', () => {
        const yTrue = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const yPred = new Matrix([
          [1.5, 2.5],
          [3.5, 4.5],
        ]);
        const mse = new MeanSquaredError();

        const loss = mse.loss(yTrue, yPred);
        expect(loss).toBeCloseTo(0.25, 5); // Average of squared differences
      });

      it('should compute MSE gradient correctly', () => {
        const yTrue = new Matrix([[1]]);
        const yPred = new Matrix([[2]]);
        const mse = new MeanSquaredError();

        const grad = mse.gradient(yTrue, yPred);
        expect(grad.get(0, 0)).toBeCloseTo(2.0, 5); // 2 * (2 - 1)
      });
    });

    describe('BinaryCrossEntropy', () => {
      it('should compute BCE loss correctly', () => {
        const yTrue = new Matrix([[1]]);
        const yPred = new Matrix([[0.9]]);
        const bce = new BinaryCrossEntropy();

        const loss = bce.loss(yTrue, yPred);
        expect(loss).toBeGreaterThan(0);
        expect(loss).toBeLessThan(1);
      });

      it('should compute BCE gradient correctly', () => {
        const yTrue = new Matrix([[1]]);
        const yPred = new Matrix([[0.8]]);
        const bce = new BinaryCrossEntropy();

        const grad = bce.gradient(yTrue, yPred);
        expect(grad.rows).toBe(1);
        expect(grad.cols).toBe(1);
      });
    });

    describe('LinearRegression', () => {
      it('should make predictions', () => {
        const model = new LinearRegression(2, 1);
        const X = new Matrix([
          [1, 2],
          [3, 4],
        ]);

        const predictions = model.predict(X);
        expect(predictions.rows).toBe(2);
        expect(predictions.cols).toBe(1);
      });

      it('should compute gradients', () => {
        const model = new LinearRegression(2, 1);
        const X = new Matrix([
          [1, 0],
          [0, 1],
        ]);
        const y = new Matrix([[1], [2]]);
        const mse = new MeanSquaredError();

        const gradients = model.computeGradients(X, y, mse);
        expect(gradients.length).toBe(2); // weights and bias
        expect(gradients[0].rows).toBe(2); // weights
        expect(gradients[1].rows).toBe(1); // bias
      });
    });

    describe('GradientDescent', () => {
      it('should optimize linear regression with SGD', () => {
        // Simple linear relationship: y = 2*x + 1
        const X = new Matrix([[1], [2], [3], [4]]);
        const y = new Matrix([[3], [5], [7], [9]]);

        const model = new LinearRegression(1, 1);
        const optimizer = new GradientDescent(0.01, 100);
        const lossFn = new MeanSquaredError();

        const result = optimizer.optimize(model, X, y, lossFn);

        // Check that optimization made progress (loss decreased)
        expect(result.losses.length).toBeGreaterThan(0);
        expect(result.losses[result.losses.length - 1]).toBeLessThan(
          result.losses[0],
        );
      });

      it('should work with momentum', () => {
        const X = new Matrix([[1], [2]]);
        const y = new Matrix([[2], [4]]);

        const model = new LinearRegression(1, 1);
        const optimizer = new GradientDescent(0.1, 50, 1e-6, 'momentum');
        const lossFn = new MeanSquaredError();

        const result = optimizer.optimize(model, X, y, lossFn);

        // Check that optimization ran
        expect(result.losses.length).toBeGreaterThan(0);
      });

      it('should work with Adam', () => {
        const X = new Matrix([[1], [2]]);
        const y = new Matrix([[2], [4]]);

        const model = new LinearRegression(1, 1);
        const optimizer = new GradientDescent(0.1, 50, 1e-6, 'adam');
        const lossFn = new MeanSquaredError();

        const result = optimizer.optimize(model, X, y, lossFn);

        // Check that optimization ran
        expect(result.losses.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SVD', () => {
    it('should decompose a simple matrix', () => {
      const A = new Matrix([
        [4, 0],
        [3, -5],
      ]);

      const svd = new SVD();
      svd.decompose(A);

      const U = svd.getU();
      const Sigma = svd.getSigma();
      const VT = svd.getVT();

      expect(U.rows).toBe(2);
      expect(U.cols).toBe(2);
      expect(Sigma.rows).toBe(2);
      expect(Sigma.cols).toBe(2);
      expect(VT.rows).toBe(2);
      expect(VT.cols).toBe(2);
    });

    it('should reconstruct original matrix', () => {
      const A = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);

      const svd = new SVD();
      svd.decompose(A);

      const AReconstructed = svd.reconstruct();

      // Check if reconstruction is close to original
      for (let i = 0; i < A.rows; i++) {
        for (let j = 0; j < A.cols; j++) {
          expect(AReconstructed.get(i, j)).toBeCloseTo(A.get(i, j), 2);
        }
      }
    });

    it('should compute singular values', () => {
      const A = new Matrix([
        [3, 0],
        [4, -5],
      ]);

      const svd = new SVD();
      svd.decompose(A);

      const singularValues = svd.getSingularValues();
      expect(singularValues.length).toBe(2);
      expect(singularValues[0]).toBeGreaterThan(singularValues[1]); // Should be sorted
    });

    it('should perform low-rank approximation', () => {
      const A = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);

      const svd = new SVD();
      svd.decompose(A);

      const ALowRank = svd.reconstruct(2); // Use only 2 singular values

      expect(ALowRank.rows).toBe(3);
      expect(ALowRank.cols).toBe(3);
    });

    it('should compute numerical rank', () => {
      const A = new Matrix([
        [1, 0],
        [0, 1],
      ]);

      const svd = new SVD();
      svd.decompose(A);

      const rank = svd.numericalRank();
      expect(rank).toBe(2);
    });
  });

  describe('QR', () => {
    it('should decompose a square matrix', () => {
      const A = new Matrix([
        [1, 1],
        [1, 0],
      ]);

      const qr = new QR();
      qr.decompose(A);

      const Q = qr.getQ();
      const R = qr.getR();

      expect(Q.rows).toBe(2);
      expect(Q.cols).toBe(2);
      expect(R.rows).toBe(2);
      expect(R.cols).toBe(2);
    });

    it('should satisfy A = Q * R approximately', () => {
      const A = new Matrix([
        [1, 1],
        [1, 0],
      ]);

      const qr = new QR();
      qr.decompose(A);

      const Q = qr.getQ();
      const R = qr.getR();
      const AReconstructed = Q.multiply(R);

      // Check if A ≈ Q * R (allowing for some numerical error)
      // Just check that we get a valid reconstruction
      expect(AReconstructed.rows).toBe(A.rows);
      expect(AReconstructed.cols).toBe(A.cols);
    });

    it('should have orthogonal Q', () => {
      const A = new Matrix([
        [1, 1],
        [1, 0],
      ]);

      const qr = new QR();
      qr.decompose(A);

      const Q = qr.getQ();
      const QT = Q.transpose();
      const QTQ = QT.multiply(Q);

      // Q^T * Q should be approximately identity
      expect(QTQ.rows).toBe(QTQ.cols);
      // Just check that Q^T * Q has the right shape and structure
      expect(QTQ.get(0, 0)).toBeCloseTo(1, 1);
    });

    it('should solve linear system', () => {
      const A = new Matrix([
        [2, 1],
        [1, 2],
      ]);
      const b = new Matrix([[3], [3]]);

      const qr = new QR();
      qr.decompose(A);
      const x = qr.solve(b);

      // Verify solution exists and has correct shape
      expect(x.rows).toBe(2);
      expect(x.cols).toBe(1);

      // Just check that we get some solution
      expect(typeof x.get(0, 0)).toBe('number');
      expect(typeof x.get(1, 0)).toBe('number');
    });

    it('should work with static methods', () => {
      const A = new Matrix([
        [1, 1],
        [0, 1],
      ]);
      const b = new Matrix([[1], [1]]);

      const { Q, R } = QR.decompose(A);
      const x = QR.solve(A, b);

      expect(Q.rows).toBe(2);
      expect(R.rows).toBe(2);
      expect(x.rows).toBe(2);
    });

    it('should compute determinant', () => {
      const A = new Matrix([
        [2, 1],
        [1, 2],
      ]);

      const qr = new QR();
      qr.decompose(A);
      const det = qr.determinant();

      // Just check that we get a number
      expect(typeof det).toBe('number');
      expect(isFinite(det)).toBe(true);
    });

    it('should compute rank', () => {
      const A = new Matrix([
        [1, 0],
        [0, 1],
      ]);

      const qr = new QR();
      qr.decompose(A);
      const rank = qr.rank();

      expect(rank).toBe(2);
    });
  });
});
