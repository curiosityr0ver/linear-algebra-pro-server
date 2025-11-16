import { IsArray, IsEnum, IsNumber, IsOptional, Min, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatrixDto } from './matrix.dto';

export enum OptimizationMethod {
  SGD = 'sgd',
  MOMENTUM = 'momentum',
  ADAM = 'adam'
}

export enum LossFunction {
  MSE = 'mse',
  BINARY_CROSS_ENTROPY = 'binary_crossentropy'
}

export class GradientDescentOptionsDto {
  @ApiPropertyOptional({
    description: 'Optimization method',
    enum: OptimizationMethod,
    default: OptimizationMethod.SGD
  })
  @IsOptional()
  @IsEnum(OptimizationMethod)
  method?: OptimizationMethod = OptimizationMethod.SGD;

  @ApiPropertyOptional({
    description: 'Learning rate',
    example: 0.01,
    default: 0.01,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  learningRate?: number = 0.01;

  @ApiPropertyOptional({
    description: 'Maximum number of iterations',
    example: 1000,
    default: 1000,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxIterations?: number = 1000;

  @ApiPropertyOptional({
    description: 'Convergence tolerance',
    example: 1e-6,
    default: 1e-6,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tolerance?: number = 1e-6;

  @ApiPropertyOptional({
    description: 'Momentum coefficient (only for momentum method)',
    example: 0.9,
    minimum: 0,
    maximum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  momentumBeta?: number;

  @ApiPropertyOptional({
    description: 'Adam beta1 parameter',
    example: 0.9,
    minimum: 0,
    maximum: 1,
    default: 0.9
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adamBeta1?: number = 0.9;

  @ApiPropertyOptional({
    description: 'Adam beta2 parameter',
    example: 0.999,
    minimum: 0,
    maximum: 1,
    default: 0.999
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adamBeta2?: number = 0.999;

  @ApiPropertyOptional({
    description: 'Adam epsilon parameter',
    example: 1e-8,
    minimum: 0,
    default: 1e-8
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adamEpsilon?: number = 1e-8;
}

export class LinearRegressionTrainDto {
  @ApiProperty({
    description: 'Training input data (n_samples x n_features)',
    example: [[1, 2], [3, 4], [5, 6]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  X: MatrixDto;

  @ApiProperty({
    description: 'Training target values (n_samples x n_outputs)',
    example: [[1], [2], [3]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  y: MatrixDto;

  @ApiPropertyOptional({
    description: 'Optimization options',
    type: GradientDescentOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GradientDescentOptionsDto)
  options?: GradientDescentOptionsDto;

  @ApiPropertyOptional({
    description: 'Loss function to use',
    enum: LossFunction,
    default: LossFunction.MSE
  })
  @IsOptional()
  @IsEnum(LossFunction)
  lossFunction?: LossFunction = LossFunction.MSE;
}

export class LinearRegressionResultDto {
  @ApiProperty({
    description: 'Trained model weights',
    type: MatrixDto
  })
  weights: MatrixDto;

  @ApiProperty({
    description: 'Trained model bias',
    type: MatrixDto
  })
  bias: MatrixDto;

  @ApiProperty({
    description: 'Training loss history',
    example: [10.5, 8.2, 6.1, 4.3, 2.8, 1.5]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  loss_history: number[];

  @ApiProperty({
    description: 'Whether the training converged',
    example: true
  })
  converged: boolean;

  @ApiProperty({
    description: 'Number of iterations performed',
    example: 150
  })
  iterations: number;

  @ApiProperty({
    description: 'Final training loss',
    example: 0.023
  })
  final_loss: number;
}

export class LinearRegressionPredictDto {
  @ApiProperty({
    description: 'Input data for prediction (n_samples x n_features)',
    example: [[1.5, 2.5], [3.5, 4.5]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  X: MatrixDto;
}

export class LinearRegressionPredictResultDto {
  @ApiProperty({
    description: 'Predicted values',
    type: MatrixDto
  })
  predictions: MatrixDto;
}

export class TrainedModelSummaryDto {
  @ApiProperty({
    description: 'Unique identifier of the trained model'
  })
  @IsString()
  modelId: string;

  @ApiProperty({
    description: 'Type of model',
    example: 'linear_regression'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'ISO timestamp when the model was trained',
    example: '2025-11-09T10:30:15.123Z'
  })
  @IsString()
  created: string;

  @ApiProperty({
    description: 'Optimization method that was used during training',
    enum: OptimizationMethod
  })
  optimizer: OptimizationMethod;

  @ApiProperty({
    description: 'Loss function that was optimized',
    enum: LossFunction
  })
  lossFunction: LossFunction;

  @ApiProperty({
    description: 'Final loss achieved at the end of training',
    example: 0.0123
  })
  @IsNumber()
  final_loss: number;

  @ApiProperty({
    description: 'Total iterations that were executed',
    example: 120
  })
  @IsNumber()
  iterations: number;

  @ApiProperty({
    description: 'Whether the optimization converged before reaching the iteration limit',
    example: true
  })
  converged: boolean;
}

export class LinearRegressionHistoryDto {
  @ApiProperty({
    description: 'Identifier of the trained model'
  })
  @IsString()
  modelId: string;

  @ApiProperty({
    description: 'Loss value captured after each iteration',
    example: [10.5, 3.2, 0.6, 0.05]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  loss_history: number[];

  @ApiProperty({
    description: 'Total iterations executed during training',
    example: 80
  })
  @IsNumber()
  iterations: number;

  @ApiProperty({
    description: 'Final loss achieved at the end of training',
    example: 0.004
  })
  @IsNumber()
  final_loss: number;

  @ApiProperty({
    description: 'Whether the training converged within the specified tolerance',
    example: true
  })
  converged: boolean;

  @ApiProperty({
    description: 'Loss function used during training',
    enum: LossFunction
  })
  lossFunction: LossFunction;

  @ApiProperty({
    description: 'Optimizer that was used to minimize the loss',
    enum: OptimizationMethod
  })
  optimizer: OptimizationMethod;
}