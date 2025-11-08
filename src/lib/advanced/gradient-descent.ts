import { Matrix } from '../matrix';

/**
 * Interface for loss functions
 */
export interface LossFunction {
  /**
   * Compute loss value
   * @param yTrue True values
   * @param yPred Predicted values
   * @returns Loss value
   */
  loss(yTrue: Matrix, yPred: Matrix): number;

  /**
   * Compute gradient of loss with respect to predictions
   * @param yTrue True values
   * @param yPred Predicted values
   * @returns Gradient matrix
   */
  gradient(yTrue: Matrix, yPred: Matrix): Matrix;
}

/**
 * Mean Squared Error loss function
 */
export class MeanSquaredError implements LossFunction {
  loss(yTrue: Matrix, yPred: Matrix): number {
    if (
      yTrue.shape[0] !== yPred.shape[0] ||
      yTrue.shape[1] !== yPred.shape[1]
    ) {
      throw new Error('Shape mismatch between true and predicted values');
    }

    let sum = 0;
    for (let i = 0; i < yTrue.rows; i++) {
      for (let j = 0; j < yTrue.cols; j++) {
        const diff = yTrue.get(i, j) - yPred.get(i, j);
        sum += diff * diff;
      }
    }
    return sum / (yTrue.rows * yTrue.cols);
  }

  gradient(yTrue: Matrix, yPred: Matrix): Matrix {
    // dL/dyPred = 2 * (yPred - yTrue) / n
    const diff = yPred.subtract(yTrue);
    return diff.multiplyScalar(2.0 / (yTrue.rows * yTrue.cols));
  }
}

/**
 * Binary Cross Entropy loss function
 */
export class BinaryCrossEntropy implements LossFunction {
  loss(yTrue: Matrix, yPred: Matrix): number {
    if (
      yTrue.shape[0] !== yPred.shape[0] ||
      yTrue.shape[1] !== yPred.shape[1]
    ) {
      throw new Error('Shape mismatch between true and predicted values');
    }

    let sum = 0;
    for (let i = 0; i < yTrue.rows; i++) {
      for (let j = 0; j < yTrue.cols; j++) {
        const y = yTrue.get(i, j);
        const p = Math.max(Math.min(yPred.get(i, j), 1 - 1e-15), 1e-15); // Clip for numerical stability
        sum += y * Math.log(p) + (1 - y) * Math.log(1 - p);
      }
    }
    return -sum / (yTrue.rows * yTrue.cols);
  }

  gradient(yTrue: Matrix, yPred: Matrix): Matrix {
    // dL/dyPred = (yPred - yTrue) / (yPred * (1 - yPred)) / n
    const result: number[][] = [];
    for (let i = 0; i < yTrue.rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < yTrue.cols; j++) {
        const y = yTrue.get(i, j);
        const p = Math.max(Math.min(yPred.get(i, j), 1 - 1e-15), 1e-15);
        const grad = (p - y) / (p * (1 - p));
        row.push(grad / (yTrue.rows * yTrue.cols));
      }
      result.push(row);
    }
    return new Matrix(result);
  }
}

/**
 * Interface for models that can be optimized with gradient descent
 */
export interface OptimizableModel {
  /**
   * Forward pass - make predictions
   * @param X Input data
   * @returns Predictions
   */
  predict(X: Matrix): Matrix;

  /**
   * Get current parameters
   * @returns Current parameter values
   */
  getParameters(): Matrix[];

  /**
   * Update parameters using gradients
   * @param gradients Gradients for each parameter
   */
  updateParameters(gradients: Matrix[]): void;

  /**
   * Compute gradients with respect to parameters
   * @param X Input data
   * @param yTrue True labels
   * @param lossFn Loss function
   * @returns Gradients for each parameter
   */
  computeGradients(X: Matrix, yTrue: Matrix, lossFn: LossFunction): Matrix[];
}

/**
 * Linear Regression model
 */
export class LinearRegression implements OptimizableModel {
  private weights: Matrix;
  private bias: Matrix;

  constructor(inputDim: number, outputDim: number = 1) {
    // Initialize weights randomly
    this.weights = Matrix.zeros(inputDim, outputDim);
    this.bias = Matrix.zeros(1, outputDim);

    // Random initialization
    for (let i = 0; i < inputDim; i++) {
      for (let j = 0; j < outputDim; j++) {
        this.weights.set(i, j, (Math.random() - 0.5) * 0.1);
      }
    }
    for (let j = 0; j < outputDim; j++) {
      this.bias.set(0, j, (Math.random() - 0.5) * 0.1);
    }
  }

  predict(X: Matrix): Matrix {
    // Broadcast bias to match the number of samples
    const biasBroadcasted = Matrix.zeros(X.rows, this.bias.cols);
    for (let i = 0; i < X.rows; i++) {
      for (let j = 0; j < this.bias.cols; j++) {
        biasBroadcasted.set(i, j, this.bias.get(0, j));
      }
    }
    return X.multiply(this.weights).add(biasBroadcasted);
  }

  getParameters(): Matrix[] {
    return [this.weights.clone(), this.bias.clone()];
  }

  updateParameters(gradients: Matrix[]): void {
    this.weights = this.weights.subtract(gradients[0]);
    this.bias = this.bias.subtract(gradients[1]);
  }

  computeGradients(X: Matrix, yTrue: Matrix, lossFn: LossFunction): Matrix[] {
    const yPred = this.predict(X);
    const lossGrad = lossFn.gradient(yTrue, yPred);

    // Gradient w.r.t. weights: X^T * lossGrad
    const weightGrad = X.transpose().multiply(lossGrad);

    // Gradient w.r.t. bias: sum of lossGrad along rows
    const biasGradData: number[][] = [[]];
    for (let j = 0; j < lossGrad.cols; j++) {
      let sum = 0;
      for (let i = 0; i < lossGrad.rows; i++) {
        sum += lossGrad.get(i, j);
      }
      biasGradData[0].push(sum);
    }
    const biasGrad = new Matrix(biasGradData);

    return [weightGrad, biasGrad];
  }
}

/**
 * Gradient Descent optimizer
 */
export class GradientDescent {
  private learningRate: number;
  private maxIterations: number;
  private tolerance: number;
  private method: 'sgd' | 'momentum' | 'adam';
  private momentumBeta: number;
  private adamBeta1: number;
  private adamBeta2: number;
  private adamEpsilon: number;

  // Momentum/Adam state
  private velocity: Matrix[] = [];
  private m: Matrix[] = [];
  private v: Matrix[] = [];
  private t: number = 0;

  constructor(
    learningRate: number = 0.01,
    maxIterations: number = 1000,
    tolerance: number = 1e-6,
    method: 'sgd' | 'momentum' | 'adam' = 'sgd',
    options: {
      momentumBeta?: number;
      adamBeta1?: number;
      adamBeta2?: number;
      adamEpsilon?: number;
    } = {},
  ) {
    this.learningRate = learningRate;
    this.maxIterations = maxIterations;
    this.tolerance = tolerance;
    this.method = method;
    this.momentumBeta = options.momentumBeta || 0.9;
    this.adamBeta1 = options.adamBeta1 || 0.9;
    this.adamBeta2 = options.adamBeta2 || 0.999;
    this.adamEpsilon = options.adamEpsilon || 1e-8;
  }

  /**
   * Optimize a model using gradient descent
   * @param model Model to optimize
   * @param X Training data
   * @param y Training labels
   * @param lossFn Loss function
   * @returns Training history
   */
  optimize(
    model: OptimizableModel,
    X: Matrix,
    y: Matrix,
    lossFn: LossFunction,
  ): { losses: number[]; converged: boolean; iterations: number } {
    this.initializeState(model);

    const losses: number[] = [];
    let prevLoss = Infinity;
    let converged = false;

    for (let iter = 0; iter < this.maxIterations; iter++) {
      // Compute current loss
      const yPred = model.predict(X);
      const currentLoss = lossFn.loss(y, yPred);
      losses.push(currentLoss);

      // Check convergence
      if (Math.abs(prevLoss - currentLoss) < this.tolerance) {
        converged = true;
        break;
      }
      prevLoss = currentLoss;

      // Compute gradients
      const gradients = model.computeGradients(X, y, lossFn);

      // Update parameters
      const updates = this.computeUpdates(gradients);
      model.updateParameters(updates);

      this.t++;
    }

    return { losses, converged, iterations: losses.length };
  }

  private initializeState(model: OptimizableModel): void {
    const params = model.getParameters();
    this.velocity = params.map((p) => Matrix.zeros(p.rows, p.cols));

    if (this.method === 'adam') {
      this.m = params.map((p) => Matrix.zeros(p.rows, p.cols));
      this.v = params.map((p) => Matrix.zeros(p.rows, p.cols));
      this.t = 0;
    }
  }

  private computeUpdates(gradients: Matrix[]): Matrix[] {
    switch (this.method) {
      case 'sgd':
        return gradients.map((g) => g.multiplyScalar(this.learningRate));

      case 'momentum':
        for (let i = 0; i < gradients.length; i++) {
          this.velocity[i] = this.velocity[i]
            .multiplyScalar(this.momentumBeta)
            .add(gradients[i].multiplyScalar(this.learningRate));
        }
        return this.velocity.map((v) => v.clone());

      case 'adam': {
        const updates: Matrix[] = [];
        for (let i = 0; i < gradients.length; i++) {
          // Update biased first moment estimate
          this.m[i] = this.m[i]
            .multiplyScalar(this.adamBeta1)
            .add(gradients[i].multiplyScalar(1 - this.adamBeta1));

          // Update biased second moment estimate
          const gradSquared = gradients[i].elementWiseMultiply(gradients[i]);
          this.v[i] = this.v[i]
            .multiplyScalar(this.adamBeta2)
            .add(gradSquared.multiplyScalar(1 - this.adamBeta2));

          // Compute bias-corrected estimates
          const mHat = this.m[i].divideScalar(
            1 - Math.pow(this.adamBeta1, this.t + 1),
          );
          const vHat = this.v[i].divideScalar(
            1 - Math.pow(this.adamBeta2, this.t + 1),
          );

          // Compute update
          const sqrtVHat = vHat.elementWiseSqrt();
          const update = mHat
            .elementWiseDivide(sqrtVHat.addScalar(this.adamEpsilon))
            .multiplyScalar(this.learningRate);
          updates.push(update);
        }
        return updates;
      }

      default:
        throw new Error(`Unknown optimization method: ${String(this.method)}`);
    }
  }
}
