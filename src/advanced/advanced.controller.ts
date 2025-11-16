import { Body, Controller, HttpCode, HttpStatus, Post, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdvancedService } from './advanced.service';
import {
  PCATrainDto,
  PCAResultDto,
  PCATransformDto,
  SVDDto,
  SVDResultDto,
  SVDReconstructDto,
  SVDReconstructResultDto,
  QRDto,
  QRResultDto,
  QRSolveDto,
  QRSolveResultDto
} from '../dto';

@ApiTags('Advanced Algorithms')
@Controller('advanced')
export class AdvancedController {
  constructor(private readonly advancedService: AdvancedService) {}

  @Post('pca/train')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Train PCA model and transform data' })
  @ApiResponse({ status: 200, description: 'PCA training completed', type: PCAResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure matrices have compatible dimensions and options.'
  })
  trainPCA(@Body(ValidationPipe) trainingData: PCATrainDto): PCAResultDto {
    return this.advancedService.performPCA(trainingData);
  }

  @Post('pca/transform')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transform data using trained PCA model' })
  @ApiResponse({ status: 200, description: 'Data transformed with PCA' })
  @ApiBadRequestResponse({
    description: 'Validation failed. Provide both the dataset and trained PCA metadata.'
  })
  transformWithPCA(
    @Body(ValidationPipe) transformData: PCATransformDto & { trainedPCA: PCAResultDto }
  ): { X_transformed: any } {
    return this.advancedService.transformWithPCA(transformData, transformData.trainedPCA);
  }

  @Post('svd/decompose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform Singular Value Decomposition' })
  @ApiResponse({ status: 200, description: 'SVD decomposition completed', type: SVDResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or matrix cannot be decomposed.'
  })
  decomposeSVD(@Body(ValidationPipe) svdData: SVDDto): SVDResultDto {
    return this.advancedService.performSVD(svdData);
  }

  @Post('svd/reconstruct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform low-rank SVD reconstruction' })
  @ApiResponse({ status: 200, description: 'SVD reconstruction completed', type: SVDReconstructResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure requested rank is valid.'
  })
  reconstructSVD(@Body(ValidationPipe) reconstructData: SVDReconstructDto): SVDReconstructResultDto {
    return this.advancedService.reconstructWithSVD(reconstructData);
  }

  @Post('qr/decompose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform QR decomposition' })
  @ApiResponse({ status: 200, description: 'QR decomposition completed', type: QRResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or matrix cannot be decomposed.'
  })
  decomposeQR(@Body(ValidationPipe) qrData: QRDto): QRResultDto {
    return this.advancedService.performQR(qrData);
  }

  @Post('qr/solve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solve linear system using QR decomposition' })
  @ApiResponse({ status: 200, description: 'Linear system solved', type: QRSolveResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed or system cannot be solved.'
  })
  solveWithQR(@Body(ValidationPipe) solveData: QRSolveDto): QRSolveResultDto {
    return this.advancedService.solveWithQR(solveData);
  }
}
