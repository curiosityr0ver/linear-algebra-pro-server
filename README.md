# Linear Algebra Pro Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

A comprehensive, high-performance linear algebra library built with TypeScript, featuring core matrix operations and advanced algorithms including PCA, Gradient Descent, SVD, and QR decomposition.

## 🚀 Features

### Core Matrix Operations
- ✅ **Matrix Creation**: Constructor, identity, zeros, ones matrices
- ✅ **Arithmetic Operations**: Addition, subtraction, multiplication, scalar operations
- ✅ **Advanced Operations**: Transpose, trace, determinant, eigenvalues
- ✅ **Matrix Utilities**: Element access, cloning, equality checking

### Advanced Algorithms
- ✅ **Principal Component Analysis (PCA)**: Dimensionality reduction with explained variance
- ✅ **Gradient Descent**: SGD, Momentum, and Adam optimization algorithms
- ✅ **Singular Value Decomposition (SVD)**: Matrix decomposition with low-rank approximation
- ✅ **QR Decomposition**: Householder transformations for linear systems

### Quality Assurance
- ✅ **63 Comprehensive Tests** covering all functionality
- ✅ **Type-Safe TypeScript** implementation
- ✅ **Full Documentation** with mathematical background
- ✅ **Production Ready** with error handling and validation

## 📦 Installation

```bash
npm install
```

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── matrix/           # Core matrix operations
│   │   ├── matrix.ts     # Matrix class with all operations
│   │   └── matrix.spec.ts # Unit tests
│   └── advanced/         # Advanced algorithms
│       ├── pca.ts        # Principal Component Analysis
│       ├── gradient-descent.ts # Optimization framework
│       ├── svd.ts        # Singular Value Decomposition
│       ├── qr.ts         # QR Decomposition
│       └── advanced.spec.ts # Algorithm tests
├── demo.ts               # Basic matrix operations demo
├── advanced-demo.ts      # Advanced algorithms demo
└── main.ts               # NestJS server entry point
```

## 🎯 Quick Start

### Basic Matrix Operations

```typescript
import { Matrix } from './lib';

// Create matrices
const A = new Matrix([[1, 2], [3, 4]]);
const B = new Matrix([[5, 6], [7, 8]]);
const I = Matrix.identity(3);

// Arithmetic operations
const sum = A.add(B);
const product = A.multiply(B);
const transpose = A.transpose();

// Scalar operations
const scaled = A.multiplyScalar(2);
const trace = A.trace();
const det = A.determinant();

// Eigenvalue computation
const { eigenvalue, eigenvector } = A.powerIteration();
```

### Advanced Algorithms

```typescript
import { PCA, GradientDescent, LinearRegression, MeanSquaredError, SVD, QR } from './lib';

// Principal Component Analysis
const pca = new PCA();
const X_pca = pca.fitTransform(X, 2); // Reduce to 2 dimensions
const explainedVariance = pca.getExplainedVarianceRatio();

// Gradient Descent Optimization
const model = new LinearRegression(inputDim, outputDim);
const optimizer = new GradientDescent(0.01, 1000, 1e-6, 'adam');
const lossFn = new MeanSquaredError();

const result = optimizer.optimize(model, X_train, y_train, lossFn);

// Singular Value Decomposition
const svd = new SVD();
svd.decompose(matrix);
const singularValues = svd.getSingularValues();
const lowRankApprox = svd.reconstruct(5); // Rank-5 approximation

// QR Decomposition
const { Q, R } = QR.decompose(matrix);
const solution = QR.solve(A, b); // Solve A*x = b
```

## 📚 API Documentation

### Matrix Class

#### Constructor & Static Methods

```typescript
// Constructor
const matrix = new Matrix([[1, 2, 3], [4, 5, 6]]);

// Static factory methods
const identity = Matrix.identity(3);      // 3x3 identity matrix
const zeros = Matrix.zeros(2, 3);         // 2x3 zero matrix
const ones = Matrix.ones(2, 2);          // 2x2 ones matrix
```

#### Properties

```typescript
const matrix = new Matrix([[1, 2, 3], [4, 5, 6]]);

matrix.rows;        // number: 2
matrix.cols;        // number: 3
matrix.shape;       // [number, number]: [2, 3]
matrix.isSquare;    // boolean: false
```

#### Element Access

```typescript
// Get/set individual elements
const value = matrix.get(0, 1);        // Get element at [0,1]
matrix.set(0, 1, 10);                  // Set element at [0,1] to 10

// Get rows/columns
const row = matrix.getRow(0);           // number[]
const col = matrix.getColumn(1);        // Matrix (column vector)
```

#### Arithmetic Operations

```typescript
const A = new Matrix([[1, 2], [3, 4]]);
const B = new Matrix([[5, 6], [7, 8]]);

// Matrix operations
const sum = A.add(B);
const diff = A.subtract(B);
const product = A.multiply(B);

// Scalar operations
const scaled = A.multiplyScalar(2);
const divided = A.divideScalar(3);
```

#### Advanced Operations

```typescript
const A = new Matrix([[1, 2], [3, 4]]);

// Matrix properties
const transposed = A.transpose();
const trace = A.trace();                    // Sum of diagonal elements
const det = A.determinant();

// Eigenvalue computation
const { eigenvalue, eigenvector } = A.powerIteration();

// Utility methods
const cloned = A.clone();
const isEqual = A.equals(B, 1e-10);       // With tolerance
const stringRep = A.toString();
```

### Principal Component Analysis (PCA)

```typescript
import { PCA } from './lib';

const pca = new PCA();

// Fit on training data
pca.fit(X_train, nComponents);

// Transform data
const X_transformed = pca.transform(X_test);

// Fit and transform in one step
const X_reduced = pca.fitTransform(X, 2);

// Get results
const components = pca.getComponents();
const explainedVariance = pca.getExplainedVariance();
const explainedVarianceRatio = pca.getExplainedVarianceRatio();
```

**Mathematical Background:**
PCA finds principal components by computing the eigenvectors of the covariance matrix. The data is centered, and the covariance matrix is decomposed to find directions of maximum variance.

### Gradient Descent Framework

```typescript
import { GradientDescent, LinearRegression, MeanSquaredError, BinaryCrossEntropy } from './lib';

// Create model and optimizer
const model = new LinearRegression(inputDim, outputDim);
const optimizer = new GradientDescent(
  learningRate,    // 0.01
  maxIterations,   // 1000
  tolerance,       // 1e-6
  method,          // 'sgd' | 'momentum' | 'adam'
  options          // Optional: momentumBeta, adamBeta1, adamBeta2
);

// Loss functions
const mse = new MeanSquaredError();
const bce = new BinaryCrossEntropy();

// Optimize
const result = optimizer.optimize(model, X, y, lossFn);

console.log(`Converged: ${result.converged}`);
console.log(`Final loss: ${result.losses[result.losses.length - 1]}`);
console.log(`Iterations: ${result.iterations}`);
```

**Optimization Methods:**
- **SGD**: Standard gradient descent with fixed learning rate
- **Momentum**: Adds momentum term to accelerate convergence
- **Adam**: Adaptive moment estimation for robust optimization

### Singular Value Decomposition (SVD)

```typescript
import { SVD } from './lib';

const svd = new SVD();

// Decompose matrix A = U * Σ * V^T
svd.decompose(A);

// Get components
const U = svd.getU();
const Sigma = svd.getSigma();
const VT = svd.getVT();
const V = svd.getV();

// Analysis
const singularValues = svd.getSingularValues();
const conditionNumber = svd.conditionNumber();
const rank = svd.numericalRank();

// Low-rank approximation
const approximation = svd.reconstruct(k); // Keep top k singular values
```

**Mathematical Background:**
SVD decomposes a matrix A into U Σ V^T where U and V are orthogonal matrices, and Σ is diagonal with singular values. Used for low-rank approximation, condition number analysis, and pseudo-inverse computation.

### QR Decomposition

```typescript
import { QR } from './lib';

// Decompose matrix A = Q * R
const qr = new QR();
qr.decompose(A);

const Q = qr.getQ();    // Orthogonal matrix
const R = qr.getR();    // Upper triangular matrix

// Static methods
const { Q, R } = QR.decompose(A);
const solution = QR.solve(A, b);  // Solve A*x = b

// Analysis
const det = qr.determinant();
const rank = qr.rank();
```

**Mathematical Background:**
QR decomposition factors a matrix into an orthogonal matrix Q and an upper triangular matrix R. Uses Householder transformations for numerical stability. Essential for solving linear systems and least squares problems.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm test -- --testPathPattern=matrix.spec.ts
npm test -- --testPathPattern=advanced.spec.ts

# Run with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 🎮 Demos

### Basic Matrix Operations Demo
```bash
npx ts-node src/demo.ts
```

### Advanced Algorithms Demo
```bash
npx ts-node src/advanced-demo.ts
```

The advanced demo showcases:
- PCA for dimensionality reduction
- Gradient descent optimization
- SVD matrix decomposition
- QR linear system solving

## 🔧 Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Mathematical Background

### Matrix Operations
- **Trace**: Sum of diagonal elements, tr(A) = Σᵢ aᵢᵢ
- **Determinant**: Volume scaling factor of linear transformation
- **Eigenvalues**: Scalars λ where A*v = λ*v
- **Power Iteration**: Iterative method for dominant eigenvalue

### Advanced Algorithms

#### PCA
- **Centering**: Subtract mean from each feature
- **Covariance**: C = (1/n) * X^T * X
- **Eigen-decomposition**: Find eigenvectors of covariance matrix
- **Projection**: X_pca = X_centered * eigenvectors

#### Gradient Descent
- **SGD**: θ = θ - α * ∇L(θ)
- **Momentum**: v = β*v + ∇L(θ), θ = θ - α*v
- **Adam**: Adaptive learning rates with moment estimates

#### SVD
- **Decomposition**: A = U Σ V^T
- **Singular Values**: Diagonal elements of Σ
- **Low-rank**: Aₖ = Uₖ Σₖ Vₖ^T

#### QR Decomposition
- **Householder**: H = I - β*v*v^T
- **Orthogonality**: Q^T * Q = I
- **Linear Systems**: A*x = b → R*x = Q^T*b

## 🚦 Error Handling

The library provides comprehensive error handling:

```typescript
// Matrix dimension mismatches
A.add(B); // Throws if dimensions don't match

// Invalid operations on non-square matrices
A.determinant(); // Throws if A is not square

// Out of bounds access
matrix.get(-1, 0); // Throws index error

// Invalid input types
new Matrix([[1, 'invalid']]); // Throws type error
```

## ⚡ Performance Considerations

- **Immutable Operations**: All methods return new matrices
- **Efficient Algorithms**: Optimized implementations for numerical stability
- **Memory Management**: No memory leaks in iterative algorithms
- **Type Safety**: Compile-time type checking prevents runtime errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📚 References

- **Linear Algebra and Its Applications** by Gilbert Strang
- **Matrix Computations** by Gene H. Golub and Charles F. Van Loan
- **Numerical Linear Algebra** by Lloyd N. Trefethen and David Bau III
- **Deep Learning** by Ian Goodfellow, Yoshua Bengio, and Aaron Courville

---

Built with ❤️ using TypeScript, NestJS, and comprehensive mathematical rigor.
