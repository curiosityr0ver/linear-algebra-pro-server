# Linear Algebra Pro API Documentation

## Overview

This API provides comprehensive linear algebra operations, advanced mathematical algorithms, and machine learning capabilities through REST endpoints. Built with NestJS and TypeScript, it offers a robust, type-safe interface for mathematical computations.

## Base URL
```
http://localhost:3000
```

## API Documentation
📚 **Interactive API Documentation**: [http://localhost:3000/api](http://localhost:3000/api)

## Authentication
Currently, no authentication is required. All endpoints are publicly accessible.

---

## 1. Matrix Operations

### 1.1 Create Matrices

#### Create Identity Matrix
```http
POST /matrix/create/identity/{size}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/create/identity/3" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "result": {
    "data": [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    "rows": 3,
    "cols": 3,
    "shape": [3, 3]
  },
  "metadata": {
    "operation": "identity",
    "size": 3
  }
}
```

#### Create Zeros Matrix
```http
POST /matrix/create/zeros?rows=2&cols=3
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/create/zeros?rows=2&cols=3" \
  -H "Content-Type: application/json"
```

#### Create Ones Matrix
```http
POST /matrix/create/ones?rows=2&cols=3
```

### 1.2 Arithmetic Operations

#### Add Matrices
```http
POST /matrix/add
```

**Request Body:**
```json
{
  "matrixA": {
    "data": [[1, 2], [3, 4]]
  },
  "matrixB": {
    "data": [[5, 6], [7, 8]]
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/add" \
  -H "Content-Type: application/json" \
  -d '{
    "matrixA": {"data": [[1, 2], [3, 4]]},
    "matrixB": {"data": [[5, 6], [7, 8]]}
  }'
```

**Response:**
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

#### Subtract Matrices
```http
POST /matrix/subtract
```

#### Multiply Matrices
```http
POST /matrix/multiply
```

#### Scalar Operations
```http
POST /matrix/multiply-scalar
POST /matrix/divide-scalar
```

**Example (Multiply by scalar):**
```json
{
  "matrixA": {
    "data": [[1, 2], [3, 4]]
  },
  "scalar": 2.5
}
```

### 1.3 Matrix Properties

#### Transpose Matrix
```http
POST /matrix/transpose
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/transpose" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"data": [[1, 2, 3], [4, 5, 6]]}}'
```

**Response:**
```json
{
  "result": {
    "data": [[1, 4], [2, 5], [3, 6]],
    "rows": 3,
    "cols": 2,
    "shape": [3, 2]
  },
  "metadata": {
    "operation": "transpose",
    "original_shape": [2, 3],
    "new_shape": [3, 2]
  }
}
```

#### Calculate Trace
```http
POST /matrix/trace
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/trace" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"data": [[1, 2], [3, 4]]}}'
```

**Response:**
```json
{
  "trace": 5,
  "matrix": {
    "data": [[1, 2], [3, 4]],
    "rows": 2,
    "cols": 2,
    "shape": [2, 2]
  }
}
```

#### Calculate Determinant
```http
POST /matrix/determinant
```

#### Calculate Eigenvalues
```http
POST /matrix/eigenvalues
```

### 1.4 Matrix Information

#### Get Matrix Properties
```http
POST /matrix/info
```

**Example:**
```bash
curl -X POST "http://localhost:3000/matrix/info" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"data": [[1, 2, 3], [4, 5, 6]]}}'
```

**Response:**
```json
{
  "matrix": {
    "data": [[1, 2, 3], [4, 5, 6]],
    "rows": 2,
    "cols": 3,
    "shape": [2, 3]
  },
  "properties": {
    "rows": 2,
    "cols": 3,
    "shape": [2, 3],
    "isSquare": false,
    "size": 6
  }
}
```

#### Check Matrix Equality
```http
POST /matrix/equals?tolerance=1e-10
```

---

## 2. Advanced Algorithms

### 2.1 Principal Component Analysis (PCA)

#### Train PCA Model
```http
POST /advanced/pca/train
```

**Request Body:**
```json
{
  "X": {
    "data": [
      [1, 2.1], [2, 3.9], [3, 6.1], [4, 8.2], [5, 10.0],
      [1.1, 2.2], [2.1, 3.8], [3.1, 6.2], [4.1, 8.1], [5.1, 9.9]
    ]
  },
  "nComponents": 1
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/advanced/pca/train" \
  -H "Content-Type: application/json" \
  -d '{
    "X": {"data": [[1, 2], [2, 4], [3, 6], [4, 8], [5, 10]]},
    "nComponents": 1
  }'
```

**Response:**
```json
{
  "X_transformed": {
    "data": [[-2.027], [1.573], [0.0], [-1.573], [2.027]],
    "rows": 5,
    "cols": 1,
    "shape": [5, 1]
  },
  "components": {
    "data": [[0.447, 0.894]],
    "rows": 1,
    "cols": 2,
    "shape": [1, 2]
  },
  "explained_variance": [8.0],
  "explained_variance_ratio": [1.0],
  "n_components": 1
}
```

#### Transform with PCA
```http
POST /advanced/pca/transform
```

### 2.2 Singular Value Decomposition (SVD)

#### Decompose Matrix
```http
POST /advanced/svd/decompose
```

**Request Body:**
```json
{
  "matrix": {
    "data": [[4, 0, 2], [0, 3, -1], [2, -1, 1]]
  },
  "maxIterations": 100,
  "tolerance": 1e-10
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/advanced/svd/decompose" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"data": [[4, 0, 2], [0, 3, -1], [2, -1, 1]]}}'
```

**Response:**
```json
{
  "U": {
    "data": [[0.816, -0.408], [0.408, 0.816], [0.408, 0.408]],
    "rows": 3,
    "cols": 2,
    "shape": [3, 2]
  },
  "Sigma": {
    "data": [[5.103, 0], [0, 3.146]],
    "rows": 2,
    "cols": 2,
    "shape": [2, 2]
  },
  "VT": {
    "data": [[0.816, 0.408, 0.408], [-0.408, 0.816, -0.408]],
    "rows": 2,
    "cols": 3,
    "shape": [2, 3]
  },
  "singular_values": [5.103, 3.146],
  "condition_number": 1.623,
  "numerical_rank": 2
}
```

#### Low-Rank Reconstruction
```http
POST /advanced/svd/reconstruct
```

### 2.3 QR Decomposition

#### Decompose Matrix
```http
POST /advanced/qr/decompose
```

**Request Body:**
```json
{
  "matrix": {
    "data": [[1, 1], [1, 0]]
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/advanced/qr/decompose" \
  -H "Content-Type: application/json" \
  -d '{"matrix": {"data": [[1, 1], [1, 0]]}}'
```

**Response:**
```json
{
  "Q": {
    "data": [[-0.707, 0.707], [-0.707, -0.707]],
    "rows": 2,
    "cols": 2,
    "shape": [2, 2]
  },
  "R": {
    "data": [[-1.414, -0.707], [0, 0.707]],
    "rows": 2,
    "cols": 2,
    "shape": [2, 2]
  },
  "determinant": 1.0,
  "rank": 2
}
```

#### Solve Linear System
```http
POST /advanced/qr/solve
```

---

## 3. Machine Learning

### 3.1 Linear Regression

#### Train Model
```http
POST /ml/linear-regression/train
```

**Request Body:**
```json
{
  "X": {
    "data": [[1], [2], [3], [4]]
  },
  "y": {
    "data": [[3], [5], [7], [9]]
  },
  "options": {
    "learningRate": 0.01,
    "maxIterations": 1000,
    "tolerance": 1e-6,
    "method": "adam",
    "adamBeta1": 0.9,
    "adamBeta2": 0.999,
    "adamEpsilon": 1e-8
  },
  "lossFunction": "mse"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/ml/linear-regression/train" \
  -H "Content-Type: application/json" \
  -d '{
    "X": {"data": [[1], [2], [3], [4]]},
    "y": {"data": [[3], [5], [7], [9]]},
    "options": {
      "learningRate": 0.01,
      "maxIterations": 1000,
      "method": "adam"
    }
  }'
```

**Response:**
```json
{
  "modelId": "linear_regression_1703123456789_abc123def",
  "result": {
    "weights": {
      "data": [[2.0]],
      "rows": 1,
      "cols": 1,
      "shape": [1, 1]
    },
    "bias": {
      "data": [[1.0]],
      "rows": 1,
      "cols": 1,
      "shape": [1, 1]
    },
    "loss_history": [75.647, 0.281, 0.001, 0.0],
    "converged": true,
    "iterations": 4,
    "final_loss": 0.0
  }
}
```

#### Make Predictions
```http
POST /ml/linear-regression/{modelId}/predict
```

**Example:**
```bash
curl -X POST "http://localhost:3000/ml/linear-regression/linear_regression_1703123456789_abc123def/predict" \
  -H "Content-Type: application/json" \
  -d '{"X": {"data": [[1.5], [2.5]]}}'
```

**Response:**
```json
{
  "predictions": {
    "data": [[4.0], [6.0]],
    "rows": 2,
    "cols": 1,
    "shape": [2, 1]
  }
}
```

#### Manage Models

**List Models:**
```http
GET /ml/models
```

**Get Model Info:**
```http
GET /ml/models/{modelId}
```

**Delete Model:**
```http
DELETE /ml/models/{modelId}
```

---

## 4. Error Handling

### Common Error Responses

#### Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "matrixA must be a 2D array",
    "scalar must be a number"
  ],
  "error": "Bad Request"
}
```

#### Matrix Dimension Error
```json
{
  "statusCode": 400,
  "message": "Cannot add matrices: shapes [2, 2] and [2, 3] are incompatible",
  "error": "Bad Request"
}
```

#### Model Not Found
```json
{
  "statusCode": 404,
  "message": "Model with ID linear_regression_123 not found",
  "error": "Not Found"
}
```

---

## 5. Data Types

### Matrix Format
All matrices are represented as 2D arrays:
```json
{
  "data": [[1, 2, 3], [4, 5, 6]],
  "rows": 2,
  "cols": 3,
  "shape": [2, 3]
}
```

### Optimization Methods
- `"sgd"`: Standard Gradient Descent
- `"momentum"`: Momentum-based optimization
- `"adam"`: Adaptive Moment Estimation

### Loss Functions
- `"mse"`: Mean Squared Error
- `"binary_crossentropy"`: Binary Cross Entropy

---

## 6. Performance Considerations

- **Large Matrices**: Consider memory usage for matrices > 1000x1000
- **Iteration Limits**: SVD and eigenvalue computations may be slow for large matrices
- **Convergence**: Gradient descent may require tuning for complex problems
- **Precision**: All operations use double precision floating point

---

## 7. Examples

### Complete Workflow Example

```bash
# 1. Create training data
curl -X POST "http://localhost:3000/matrix/create/zeros?rows=10&cols=2"

# 2. Perform PCA for dimensionality reduction
curl -X POST "http://localhost:3000/advanced/pca/train" \
  -H "Content-Type: application/json" \
  -d '{"X": {"data": [[1,2],[2,4],[3,6],[4,8],[5,10],[1.1,2.1],[2.1,4.1],[3.1,6.1],[4.1,8.1],[5.1,10.1]]}, "nComponents": 1}'

# 3. Train linear regression model
curl -X POST "http://localhost:3000/ml/linear-regression/train" \
  -H "Content-Type: application/json" \
  -d '{
    "X": {"data": [[1],[2],[3],[4],[5]]},
    "y": {"data": [[2],[4],[6],[8],[10]]},
    "options": {"learningRate": 0.01, "method": "adam"}
  }'

# 4. Make predictions
curl -X POST "http://localhost:3000/ml/linear-regression/{modelId}/predict" \
  -H "Content-Type: application/json" \
  -d '{"X": {"data": [[6],[7]]}}'
```

---

## 8. Development

### Running the Server
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

**For more details, visit the interactive API documentation at `http://localhost:3000/api`**
