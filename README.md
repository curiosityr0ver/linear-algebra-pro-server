# Linear Algebra Pro Server

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)

> A NestJS-powered REST API and numerical computing toolkit that exposes high-performance matrix operations, advanced linear algebra algorithms, and gradient-based machine learning utilities.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [REST API Overview](#rest-api-overview)
  - [Matrix API](#matrix-api)
  - [Advanced Algorithms API](#advanced-algorithms-api)
  - [Machine Learning API](#machine-learning-api)
- [Payload Schemas](#payload-schemas)
- [Library Usage (Node Module)](#library-usage-node-module)
- [Testing](#testing)
- [Development](#development)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Features
- **REST API**
  - Matrix CRUD operations, arithmetic, and analysis endpoints.
  - Advanced endpoints for PCA, SVD, and QR decomposition.
  - Linear regression training, prediction, and model lifecycle management.
- **Numerical Library**
  - Immutable matrix implementation with validation and rich utility methods.
  - Optimization toolkit with SGD, Momentum, and Adam gradient descent.
  - Principal component analysis, singular value decomposition, and QR factorisation.
- **Tooling & Quality**
  - NestJS with global validation, Swagger/OpenAPI docs, and configurable CORS.
  - Comprehensive Jest unit tests across matrix, advanced, and ML components.
  - ESLint + Prettier configuration for consistent TypeScript code style.

## Prerequisites
- Node.js **20.x** (NestJS 11 requires Node 18+, 20.x recommended).
- npm **10.x** or newer.
- (Optional) `ts-node` for running demos from the command line.

## Installation
```bash
git clone https://github.com/<your-org>/linear-algebra-pro-server.git
cd linear-algebra-pro-server
npm install
```

## Configuration
Create a `.env` file (or set environment variables) to adjust runtime behaviour.

| Variable         | Default                | Description |
| ---------------- | ---------------------- | ----------- |
| `PORT`           | `3001`                 | Port the HTTP server listens on. |
| `CLIENT_ORIGIN`  | `http://localhost:3000` | Comma-separated list of origins allowed by CORS. |

Example `.env`:
```dotenv
PORT=3001
CLIENT_ORIGIN=http://localhost:3000,http://localhost:5173
```

## Running Locally
```bash
# Start in watch mode with hot reload
npm run start:dev

# Start once (useful for production preview)
npm run start

# Build and run compiled output
npm run build
npm run start:prod
```

The server logs the effective port and the Swagger UI URL:
```
🚀 Server running on http://localhost:3001
📚 API Documentation available at http://localhost:3001/api
🔐 CORS enabled for: http://localhost:3000
```

## Docker Deployment
Build and run the application in a Docker container for easy deployment.

### Prerequisites
- Docker installed and running on your system.

### Build the Image
```bash
docker build -t linear-algebra-pro-server:v1.0 .
```

### Run the Container
```bash
# Run with default settings
docker run -p 3000:3000 linear-algebra-pro-server:v1.0

# Or with custom environment variables
docker run -p 3001:3000 -e PORT=3000 -e CLIENT_ORIGIN=http://localhost:3001 linear-algebra-pro-server:v1.0
```

The container exposes port 3001. Access the API at `http://localhost:3001` and Swagger UI at `http://localhost:3001/api`.

### Production Deployment
- Push the image to a registry (e.g., Docker Hub, Google Container Registry).
- Use in Kubernetes, Docker Compose, or cloud platforms like Google Cloud Run, AWS ECS, etc.

## Project Structure
```
src/
├── advanced/
│   ├── advanced.controller.ts   # REST endpoints for PCA, SVD, QR
│   ├── advanced.module.ts
│   └── advanced.service.ts
├── dto/                         # Shared API contracts (MatrixDto, PCA DTOs, etc.)
├── lib/
│   ├── matrix/                  # Core matrix implementation and tests
│   └── advanced/                # PCA, gradient descent, SVD, QR implementations
├── matrix/                      # Matrix REST module
├── ml/                          # Machine learning REST module
├── main.ts                      # Application bootstrap, Swagger, CORS
└── app.module.ts                # Root module
```

## REST API Overview
- **Base URL:** `http://localhost:<PORT>` (default `3000`)
- **Content Type:** `application/json`
- **Swagger UI:** `http://localhost:<PORT>/api`
- **Status Codes:**
  - `200/201` for successful operations.
  - `400` for validation errors, incompatible shapes, or invalid parameters.
  - `404` when a requested trained model cannot be found.

### Matrix API
| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/matrix/create/identity/:size` | Create an `size × size` identity matrix. |
| `POST` | `/matrix/create/zeros?rows&cols` | Create a zero matrix with the provided shape. |
| `POST` | `/matrix/create/ones?rows&cols` | Create a matrix filled with ones. |
| `POST` | `/matrix/add` | Element-wise addition of two equally shaped matrices. |
| `POST` | `/matrix/subtract` | Element-wise subtraction of two equally shaped matrices. |
| `POST` | `/matrix/multiply` | Matrix multiplication (`A · B`). |
| `POST` | `/matrix/multiply-scalar` | Multiply a matrix by a scalar. |
| `POST` | `/matrix/divide-scalar` | Divide a matrix by a non-zero scalar. |
| `POST` | `/matrix/transpose` | Transpose a matrix. |
| `POST` | `/matrix/trace` | Compute the trace of a square matrix. |
| `POST` | `/matrix/determinant` | Compute the determinant of a square matrix. |
| `POST` | `/matrix/eigenvalues` | Estimate dominant eigenvalue/eigenvector (power iteration). |
| `POST` | `/matrix/info` | Retrieve metadata (rows, columns, shape, etc.). |
| `POST` | `/matrix/clone` | Deep-copy a matrix. |
| `POST` | `/matrix/equals?tolerance=<number>` | Compare two matrices within a tolerance. |

**Sample: Add two matrices**
```bash
curl -X POST http://localhost:3000/matrix/add \
  -H "Content-Type: application/json" \
  -d '{
    "matrixA": { "data": [[1,2],[3,4]] },
    "matrixB": { "data": [[5,6],[7,8]] }
  }'
```

```json
{
  "result": {
    "data": [[6, 8], [10, 12]],
    "rows": 2,
    "cols": 2,
    "shape": [2, 2]
  },
  "metadata": {
    "operation": "add",
    "shape": [2, 2]
  }
}
```

**Common 400 error**
```json
{
  "statusCode": 400,
  "message": "Cannot add matrices: shapes [2, 3] and [4, 2] are incompatible",
  "error": "Bad Request"
}
```

### Advanced Algorithms API
| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/advanced/pca/train` | Fit PCA, returning components, explained variance, and transformed data. |
| `POST` | `/advanced/pca/transform` | Transform a new dataset using previously computed PCA results. |
| `POST` | `/advanced/svd/decompose` | Perform SVD, returning `U`, `Σ`, `V`, and diagnostics. |
| `POST` | `/advanced/svd/reconstruct` | Compute a low-rank reconstruction from SVD components. |
| `POST` | `/advanced/qr/decompose` | Perform QR decomposition, returning `Q` and `R`. |
| `POST` | `/advanced/qr/solve` | Solve `A·x = b` via QR factorisation. |

**Sample: SVD decomposition**
```bash
curl -X POST http://localhost:3000/advanced/svd/decompose \
  -H "Content-Type: application/json" \
  -d '{
    "matrix": { "data": [[3, 1], [1, 3]] }
  }'
```

### Machine Learning API
| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/ml/linear-regression/train` | Train a linear regression model with gradient descent. |
| `POST` | `/ml/linear-regression/:modelId/predict` | Predict using a previously trained model. |
| `GET`  | `/ml/models` | List IDs and metadata of trained models. |
| `GET`  | `/ml/models/:modelId` | Retrieve weights, bias, and metadata for a specific model. |
| `DELETE` | `/ml/models/:modelId` | Delete a trained model from memory. |

**Train a model**
```bash
curl -X POST http://localhost:3000/ml/linear-regression/train \
  -H "Content-Type: application/json" \
  -d '{
    "X": { "data": [[1, 1], [2, 2], [3, 3]] },
    "y": { "data": [[2], [4], [6]] },
    "options": { "learningRate": 0.05, "maxIterations": 500 },
    "lossFunction": "mse"
  }'
```

```json
{
  "modelId": "linear_regression_1731157812345_u8f3p1qhk",
  "result": {
    "weights": { "data": [[1.99], [1.99]], "rows": 2, "cols": 1, "shape": [2, 1] },
    "bias": { "data": [[0.02]], "rows": 1, "cols": 1, "shape": [1, 1] },
    "loss_history": [12.5, 4.1, 0.3],
    "converged": true,
    "iterations": 120,
    "final_loss": 0.3
  }
}
```

**List trained models**
```bash
curl http://localhost:3000/ml/models
```

```json
[
  {
    "modelId": "linear_regression_1731157812345_u8f3p1qhk",
    "type": "linear_regression",
    "created": "2025-11-09T10:36:52.123Z"
  }
]
```

### Error Handling in the API
- Validation uses NestJS `ValidationPipe` with whitelist and transformation.
- Numeric operations are wrapped to surface friendly error messages as HTTP 400.
- Missing models produce HTTP 404 with a descriptive message.

## Payload Schemas
- **MatrixDto**: `{ data: number[][], rows?: number, cols?: number, shape?: [number, number] }`
- **MatrixOperationDto**: `{ matrixA: MatrixDto, matrixB?: MatrixDto, scalar?: number }`
- **LinearRegressionTrainDto**: training data matrices, gradient descent options, loss function enum.
- **LinearRegressionResultDto**: learned weights/bias as matrices, loss history, convergence metadata.
- **PCA / SVD / QR DTOs**: located under `src/dto/` with Swagger definitions generated automatically.

Refer to the Swagger UI for the complete schema definitions generated from these DTOs.

## Library Usage (Node Module)

The REST API is backed by reusable classes located under `src/lib`. They can be imported directly for scripted or embedded use.

```typescript
import { Matrix, PCA, GradientDescent, LinearRegression, MeanSquaredError, SVD, QR } from './lib';

// Core matrix operations
const A = new Matrix([[1, 2], [3, 4]]);
const B = new Matrix([[5, 6], [7, 8]]);
const sum = A.add(B);
const determinant = A.determinant();
const { eigenvalue, eigenvector } = A.powerIteration();

// Gradient descent with linear regression
const model = new LinearRegression(A.cols, 1);
const optimizer = new GradientDescent(0.01, 1000, 1e-6, 'adam');
const mse = new MeanSquaredError();
const { losses, converged } = optimizer.optimize(model, A, new Matrix([[1], [2]]), mse);

// PCA and SVD utilities
const pca = new PCA();
const reduced = pca.fitTransform(A, 1);
const svd = new SVD();
svd.decompose(A);
const singularValues = svd.getSingularValues();

// QR for solving linear systems
const { Q, R } = QR.decompose(A);
```

## Testing
```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Target a specific suite
npm test -- --testPathPattern=matrix.spec.ts
```

## Development
```bash
# Lint and format
npm run lint
npm run format
```

Demos for quick experimentation:
```bash
npx ts-node src/demo.ts           # Core matrix operations
npx ts-node src/advanced-demo.ts  # PCA, SVD, QR, gradient descent
```

## Error Handling
- Matrix shape mismatches, invalid indices, and non-square operations raise descriptive errors.
- Scalar operations guard against `NaN` and division by zero.
- All REST endpoints convert domain errors into HTTP 400/404 responses with helpful messages.

## Performance Considerations
- Immutable matrix operations prevent accidental shared state.
- Algorithms favour numerically stable approaches (Householder QR, cofactor expansion safeguards, etc.).
- Designed for type safety and fast iteration with TypeScript generics and DTO validation.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Add tests covering your change.
4. Run linting and the full test suite.
5. Open a pull request describing the motivation and behaviour changes.

## License
Released under the **MIT License**. See `LICENSE` for details.

## References
- *Linear Algebra and Its Applications* – Gilbert Strang.
- *Matrix Computations* – Gene H. Golub & Charles F. Van Loan.
- *Numerical Linear Algebra* – Lloyd N. Trefethen & David Bau III.
- *Deep Learning* – Ian Goodfellow, Yoshua Bengio, and Aaron Courville.

---

Built with ❤️ using TypeScript, NestJS, and a passion for linear algebra.
