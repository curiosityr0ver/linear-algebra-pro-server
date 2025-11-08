import {
  Matrix,
  PCA,
  GradientDescent,
  LinearRegression,
  MeanSquaredError,
  SVD,
  QR,
} from './lib';

console.log('=== Advanced Linear Algebra Algorithms Demo ===\n');

// Helper function to extract rows
function getRows(matrix: Matrix, start: number, end: number): Matrix {
  const data: number[][] = [];
  for (let i = start; i < end; i++) {
    data.push(matrix.getRow(i));
  }
  return new Matrix(data);
}

// Generate sample data
console.log('1. Generating sample data...');
const np = 100;
const X = Matrix.zeros(np, 2);
const y = Matrix.zeros(np, 1);

// Create correlated 2D data with some noise
for (let i = 0; i < np; i++) {
  const x1 = (Math.random() - 0.5) * 10;
  const noise = (Math.random() - 0.5) * 2;
  const x2 = 2 * x1 + noise; // Strong correlation
  const target = x1 + x2 + noise; // Linear relationship

  X.set(i, 0, x1);
  X.set(i, 1, x2);
  y.set(i, 0, target);
}

console.log(`Generated ${np} samples with 2 features`);

// PCA Demo
console.log('\n2. Principal Component Analysis (PCA)...');
const pca = new PCA();
const X_pca = pca.fitTransform(X, 1);
const explained_variance = pca.getExplainedVarianceRatio();

console.log(`Original data shape: ${X.rows} x ${X.cols}`);
console.log(`PCA transformed shape: ${X_pca.rows} x ${X_pca.cols}`);
console.log(`Explained variance ratio: ${explained_variance[0].toFixed(3)}`);
console.log(
  `First few PCA components: ${X_pca.getRow(0)
    .slice(0, 3)
    .map((v) => v.toFixed(3))
    .join(', ')}...`,
);

// Linear Regression with Gradient Descent
console.log('\n3. Linear Regression with Gradient Descent...');

// Split data for training/testing
const trainSize = Math.floor(np * 0.8);
const X_train = getRows(X, 0, trainSize);
const X_test = getRows(X, trainSize, np);
const y_train = getRows(y, 0, trainSize);
const y_test = getRows(y, trainSize, np);

const model = new LinearRegression(2, 1);
const optimizer = new GradientDescent(0.01, 200, 1e-6, 'adam');
const lossFn = new MeanSquaredError();

console.log('Training model...');
const trainingResult = optimizer.optimize(model, X_train, y_train, lossFn);

console.log(`Training converged: ${trainingResult.converged}`);
console.log(`Initial loss: ${trainingResult.losses[0].toFixed(4)}`);
console.log(
  `Final loss: ${trainingResult.losses[trainingResult.losses.length - 1].toFixed(4)}`,
);
console.log(`Training iterations: ${trainingResult.iterations}`);

// Test predictions
const y_pred = model.predict(X_test);
const test_loss = lossFn.loss(y_test, y_pred);
console.log(`Test loss: ${test_loss.toFixed(4)}`);

// SVD Demo
console.log('\n4. Singular Value Decomposition (SVD)...');
const A = new Matrix([
  [4, 0, 2],
  [0, 3, -1],
  [2, -1, 1],
]);

const svd = new SVD();
svd.decompose(A);

const singularValues = svd.getSingularValues();
const conditionNumber = svd.conditionNumber();
const numericalRank = svd.numericalRank();

console.log(`Original matrix A:\n${A.toString()}`);
console.log(
  `Singular values: [${singularValues.map((v) => v.toFixed(3)).join(', ')}]`,
);
console.log(`Condition number: ${conditionNumber.toFixed(3)}`);
console.log(`Numerical rank: ${numericalRank}`);

// Low-rank approximation
const A_approx = svd.reconstruct(2);
console.log(`Low-rank approximation (rank 2):\n${A_approx.toString()}`);

// QR Decomposition Demo
console.log('\n5. QR Decomposition...');
const B = new Matrix([
  [12, -51, 4],
  [6, 167, -68],
  [-4, 24, -41],
]);

const qr = new QR();
qr.decompose(B);

const Q = qr.getQ();
const R = qr.getR();
const B_reconstructed = Q.multiply(R);

console.log(`Original matrix B:\n${B.toString()}`);
console.log(`Q (orthogonal matrix):\n${Q.toString()}`);
console.log(`R (upper triangular):\n${R.toString()}`);
console.log(`Reconstruction B ≈ Q*R:\n${B_reconstructed.toString()}`);

// Solve linear system using QR
console.log('\n6. Solving Linear System with QR...');
const C = new Matrix([
  [2, 1, -1],
  [1, 3, 2],
  [-1, 2, 4],
]);
const d = new Matrix([[1], [2], [3]]);

const x = QR.solve(C, d);
const Cx = C.multiply(x);

console.log(`System: C*x = d`);
console.log(`Solution x:\n${x.toString()}`);
console.log(`Verification C*x:\n${Cx.toString()}`);
console.log(`Original d:\n${d.toString()}`);

// Compare algorithms performance
console.log('\n7. Algorithm Comparison...');
console.log('PCA: Dimensionality reduction from 2D to 1D');
console.log(
  `   Explained variance: ${(explained_variance[0] * 100).toFixed(1)}%`,
);
console.log(
  'Gradient Descent: Converged in',
  trainingResult.iterations,
  'iterations',
);
console.log(
  'SVD: Matrix decomposition with',
  singularValues.length,
  'singular values',
);
console.log(
  'QR: Linear system solved with condition number',
  conditionNumber.toFixed(2),
);

console.log('\n=== Demo Complete ===');
