import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Train PCA model and transform data' })
  @ApiResponse({ status: 201, description: 'PCA training completed', type: PCAResultDto })
  trainPCA(@Body(ValidationPipe) trainingData: PCATrainDto): PCAResultDto {
    return this.advancedService.performPCA(trainingData);
  }

  @Post('pca/transform')
  @ApiOperation({ summary: 'Transform data using trained PCA model' })
  @ApiResponse({ status: 201, description: 'Data transformed with PCA' })
  transformWithPCA(
    @Body(ValidationPipe) transformData: PCATransformDto & { trainedPCA: PCAResultDto }
  ): { X_transformed: any } {
    return this.advancedService.transformWithPCA(transformData, transformData.trainedPCA);
  }

  @Post('svd/decompose')
  @ApiOperation({ summary: 'Perform Singular Value Decomposition' })
  @ApiResponse({ status: 201, description: 'SVD decomposition completed', type: SVDResultDto })
  decomposeSVD(@Body(ValidationPipe) svdData: SVDDto): SVDResultDto {
    return this.advancedService.performSVD(svdData);
  }

  @Post('svd/reconstruct')
  @ApiOperation({ summary: 'Perform low-rank SVD reconstruction' })
  @ApiResponse({ status: 201, description: 'SVD reconstruction completed', type: SVDReconstructResultDto })
  reconstructSVD(@Body(ValidationPipe) reconstructData: SVDReconstructDto): SVDReconstructResultDto {
    return this.advancedService.reconstructWithSVD(reconstructData);
  }

  @Post('qr/decompose')
  @ApiOperation({ summary: 'Perform QR decomposition' })
  @ApiResponse({ status: 201, description: 'QR decomposition completed', type: QRResultDto })
  decomposeQR(@Body(ValidationPipe) qrData: QRDto): QRResultDto {
    return this.advancedService.performQR(qrData);
  }

  @Post('qr/solve')
  @ApiOperation({ summary: 'Solve linear system using QR decomposition' })
  @ApiResponse({ status: 201, description: 'Linear system solved', type: QRSolveResultDto })
  solveWithQR(@Body(ValidationPipe) solveData: QRSolveDto): QRSolveResultDto {
    return this.advancedService.solveWithQR(solveData);
  }
}
