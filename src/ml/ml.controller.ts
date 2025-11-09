import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ValidationPipe,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { MLService } from './ml.service';
import {
  LinearRegressionTrainDto,
  LinearRegressionResultDto,
  LinearRegressionPredictDto,
  LinearRegressionPredictResultDto
} from '../dto';

@ApiTags('Machine Learning')
@Controller('ml')
export class MLController {
  constructor(private readonly mlService: MLService) {}

  @Post('linear-regression/train')
  @ApiOperation({ summary: 'Train linear regression model' })
  @ApiResponse({
    status: 201,
    description: 'Model trained successfully',
    schema: {
      type: 'object',
      properties: {
        modelId: { type: 'string', example: 'linear_regression_1234567890_abc123def' },
        result: { $ref: '#/components/schemas/LinearRegressionResultDto' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Training failed. Check matrix dimensions, loss function, and optimizer settings.'
  })
  async trainLinearRegression(
    @Body(ValidationPipe) trainingData: LinearRegressionTrainDto
  ): Promise<{ modelId: string; result: LinearRegressionResultDto }> {
    try {
      return await this.mlService.trainLinearRegression(trainingData);
    } catch (error) {
      throw new HttpException(
        `Training failed: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('linear-regression/:modelId/predict')
  @ApiOperation({ summary: 'Make predictions with trained linear regression model' })
  @ApiParam({ name: 'modelId', description: 'ID of the trained model', example: 'linear_regression_1234567890_abc123def' })
  @ApiResponse({ status: 201, description: 'Predictions made successfully', type: LinearRegressionPredictResultDto })
  @ApiBadRequestResponse({
    description: 'Prediction failed. Ensure input matrix matches the model shape.'
  })
  @ApiNotFoundResponse({
    description: 'Model with provided ID was not found.'
  })
  async predictWithLinearRegression(
    @Param('modelId') modelId: string,
    @Body(ValidationPipe) predictionData: LinearRegressionPredictDto
  ): Promise<LinearRegressionPredictResultDto> {
    try {
      return await this.mlService.predictWithLinearRegression(modelId, predictionData);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Prediction failed: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('models')
  @ApiOperation({ summary: 'Get list of trained models' })
  @ApiResponse({
    status: 200,
    description: 'List of trained models',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          modelId: { type: 'string' },
          type: { type: 'string' },
          created: {
            type: 'string',
            format: 'date-time',
            example: '2025-11-09T10:30:15.123Z'
          }
        }
      }
    }
  })
  getTrainedModels(): { modelId: string; type: string; created: string }[] {
    return this.mlService.getTrainedModels();
  }

  @Get('models/:modelId')
  @ApiOperation({ summary: 'Get information about a trained model' })
  @ApiParam({ name: 'modelId', description: 'ID of the trained model', example: 'linear_regression_1234567890_abc123def' })
  @ApiResponse({
    status: 200,
    description: 'Model information retrieved',
    schema: {
      type: 'object',
      properties: {
        modelId: { type: 'string' },
        type: { type: 'string' },
        weights: { $ref: '#/components/schemas/MatrixDto' },
        bias: { $ref: '#/components/schemas/MatrixDto' },
        created: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-09T10:30:15.123Z'
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Model not found.' })
  getModelInfo(@Param('modelId') modelId: string): any {
    const modelInfo = this.mlService.getModelInfo(modelId);
    if (!modelInfo) {
      throw new HttpException('Model not found', HttpStatus.NOT_FOUND);
    }
    return modelInfo;
  }

  @Delete('models/:modelId')
  @ApiOperation({ summary: 'Delete a trained model' })
  @ApiParam({ name: 'modelId', description: 'ID of the trained model', example: 'linear_regression_1234567890_abc123def' })
  @ApiResponse({
    status: 200,
    description: 'Model deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean' },
        modelId: { type: 'string' }
      }
    }
  })
  deleteModel(@Param('modelId') modelId: string): { deleted: boolean; modelId: string } {
    return this.mlService.deleteModel(modelId);
  }
}
