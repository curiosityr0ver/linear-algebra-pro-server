import { Injectable } from '@nestjs/common';
import {
  GradientDescent,
  LinearRegression,
  MeanSquaredError,
  BinaryCrossEntropy,
  LossFunction
} from '../lib';
import {
  LinearRegressionTrainDto,
  LinearRegressionResultDto,
  LinearRegressionPredictDto,
  LinearRegressionPredictResultDto,
  LossFunction as LossFunctionEnum,
  OptimizationMethod
} from '../dto';

@Injectable()
export class MLService {
  private trainedModels = new Map<string, LinearRegression>();

  /**
   * Convert 2D array to Matrix
   */
  private arrayToMatrix(data: number[][]) {
    const { Matrix } = require('../lib');
    return new Matrix(data);
  }

  /**
   * Convert Matrix to 2D array
   */
  private matrixToArray(matrix: any): number[][] {
    return matrix.data;
  }

  /**
   * Create MatrixDto from Matrix
   */
  private matrixToDto(matrix: any) {
    return {
      data: this.matrixToArray(matrix),
      rows: matrix.rows,
      cols: matrix.cols,
      shape: matrix.shape
    };
  }

  /**
   * Get loss function from enum
   */
  private getLossFunction(lossFn: LossFunctionEnum): LossFunction {
    switch (lossFn) {
      case LossFunctionEnum.MSE:
        return new MeanSquaredError();
      case LossFunctionEnum.BINARY_CROSS_ENTROPY:
        return new BinaryCrossEntropy();
      default:
        throw new Error(`Unknown loss function: ${lossFn}`);
    }
  }

  /**
   * Train linear regression model
   */
  async trainLinearRegression(
    trainingData: LinearRegressionTrainDto
  ): Promise<{ modelId: string; result: LinearRegressionResultDto }> {
    const X = this.arrayToMatrix(trainingData.X.data);
    const y = this.arrayToMatrix(trainingData.y.data);

    const inputDim = X.cols;
    const outputDim = y.cols;

    const model = new LinearRegression(inputDim, outputDim);

    // Set up optimizer
    const options = trainingData.options || {};
    const optimizer = new GradientDescent(
      options.learningRate,
      options.maxIterations,
      options.tolerance,
      options.method,
      {
        momentumBeta: options.momentumBeta,
        adamBeta1: options.adamBeta1,
        adamBeta2: options.adamBeta2,
        adamEpsilon: options.adamEpsilon
      }
    );

    // Set up loss function
    const lossFn = this.getLossFunction(trainingData.lossFunction || LossFunctionEnum.MSE);

    // Train model
    const trainingResult = optimizer.optimize(model, X, y, lossFn);

    // Store trained model
    const modelId = `linear_regression_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.trainedModels.set(modelId, model);

    const result: LinearRegressionResultDto = {
      weights: this.matrixToDto(model.getParameters()[0]),
      bias: this.matrixToDto(model.getParameters()[1]),
      loss_history: trainingResult.losses,
      converged: trainingResult.converged,
      iterations: trainingResult.iterations,
      final_loss: trainingResult.losses[trainingResult.losses.length - 1]
    };

    return { modelId, result };
  }

  /**
   * Make predictions with trained model
   */
  async predictWithLinearRegression(
    modelId: string,
    predictionData: LinearRegressionPredictDto
  ): Promise<LinearRegressionPredictResultDto> {
    const model = this.trainedModels.get(modelId);
    if (!model) {
      throw new Error(`Model with ID ${modelId} not found`);
    }

    const X = this.arrayToMatrix(predictionData.X.data);
    const predictions = model.predict(X);

    return {
      predictions: this.matrixToDto(predictions)
    };
  }

  /**
   * Get list of trained models
   */
  getTrainedModels(): { modelId: string; type: string; created: string }[] {
    const models: { modelId: string; type: string; created: string }[] = [];
    for (const [modelId, model] of this.trainedModels) {
      const [, timestamp] = modelId.split('_');
      models.push({
        modelId,
        type: 'linear_regression',
        created: new Date(parseInt(timestamp)).toISOString()
      });
    }
    return models;
  }

  /**
   * Delete trained model
   */
  deleteModel(modelId: string): { deleted: boolean; modelId: string } {
    const deleted = this.trainedModels.delete(modelId);
    return { deleted, modelId };
  }

  /**
   * Get model information
   */
  getModelInfo(modelId: string): {
    modelId: string;
    type: string;
    weights: any;
    bias: any;
    created: string;
  } | null {
    const model = this.trainedModels.get(modelId);
    if (!model) {
      return null;
    }

    const [, timestamp] = modelId.split('_');
    const [weights, bias] = model.getParameters();

    return {
      modelId,
      type: 'linear_regression',
      weights: this.matrixToDto(weights),
      bias: this.matrixToDto(bias),
      created: new Date(parseInt(timestamp)).toISOString()
    };
  }
}
