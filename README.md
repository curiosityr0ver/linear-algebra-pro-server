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
- [Deployment](#deployment)
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

## Deployment
Comprehensive deployment instructions live in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

- [Docker quickstart and container management](./DEPLOYMENT.md#docker-quickstart)
- [Container registry publishing](./DEPLOYMENT.md#publishing-to-container-registries) (Docker Hub, GCR, ECR)
- [Docker Compose orchestration](./DEPLOYMENT.md#docker-compose)
- [Kubernetes deployment](./DEPLOYMENT.md#kubernetes-deployment)
- [CI/CD automation with GitHub Actions](./DEPLOYMENT.md#cicd-automation)

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
- **Base URL:** `http://localhost:<PORT>` (default `3001`)
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
| `POST`