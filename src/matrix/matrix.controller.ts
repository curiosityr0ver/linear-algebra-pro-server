import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MatrixService } from './matrix.service';
import {
  MatrixDto,
  MatrixResultDto,
  EigenvalueResultDto,
  MatrixOperationDto
} from '../dto';

@ApiTags('Matrix Operations')
@Controller('matrix')
export class MatrixController {
  constructor(private readonly matrixService: MatrixService) {}

  @Post('create/identity/:size')
  @ApiOperation({ summary: 'Create identity matrix' })
  @ApiParam({ name: 'size', description: 'Size of the square identity matrix', example: 3 })
  @ApiResponse({ status: 201, description: 'Identity matrix created', type: MatrixResultDto })
  createIdentity(@Param('size', ParseIntPipe) size: number): MatrixResultDto {
    return this.matrixService.createIdentity(size);
  }

  @Post('create/zeros')
  @ApiOperation({ summary: 'Create zeros matrix' })
  @ApiQuery({ name: 'rows', description: 'Number of rows', example: 2 })
  @ApiQuery({ name: 'cols', description: 'Number of columns', example: 3 })
  @ApiResponse({ status: 201, description: 'Zeros matrix created', type: MatrixResultDto })
  createZeros(
    @Query('rows', ParseIntPipe) rows: number,
    @Query('cols', ParseIntPipe) cols: number
  ): MatrixResultDto {
    return this.matrixService.createZeros(rows, cols);
  }

  @Post('create/ones')
  @ApiOperation({ summary: 'Create ones matrix' })
  @ApiQuery({ name: 'rows', description: 'Number of rows', example: 2 })
  @ApiQuery({ name: 'cols', description: 'Number of columns', example: 3 })
  @ApiResponse({ status: 201, description: 'Ones matrix created', type: MatrixResultDto })
  createOnes(
    @Query('rows', ParseIntPipe) rows: number,
    @Query('cols', ParseIntPipe) cols: number
  ): MatrixResultDto {
    return this.matrixService.createOnes(rows, cols);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add two matrices' })
  @ApiResponse({ status: 201, description: 'Matrices added', type: MatrixResultDto })
  addMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for addition');
    }
    return this.matrixService.addMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('subtract')
  @ApiOperation({ summary: 'Subtract two matrices' })
  @ApiResponse({ status: 201, description: 'Matrices subtracted', type: MatrixResultDto })
  subtractMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for subtraction');
    }
    return this.matrixService.subtractMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('multiply')
  @ApiOperation({ summary: 'Multiply two matrices' })
  @ApiResponse({ status: 201, description: 'Matrices multiplied', type: MatrixResultDto })
  multiplyMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for multiplication');
    }
    return this.matrixService.multiplyMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('multiply-scalar')
  @ApiOperation({ summary: 'Multiply matrix by scalar' })
  @ApiResponse({ status: 201, description: 'Matrix multiplied by scalar', type: MatrixResultDto })
  multiplyByScalar(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (operation.scalar === undefined) {
      throw new BadRequestException('Scalar value is required for scalar multiplication');
    }
    return this.matrixService.multiplyByScalar(operation.matrixA, operation.scalar);
  }

  @Post('divide-scalar')
  @ApiOperation({ summary: 'Divide matrix by scalar' })
  @ApiResponse({ status: 201, description: 'Matrix divided by scalar', type: MatrixResultDto })
  divideByScalar(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (operation.scalar === undefined) {
      throw new BadRequestException('Scalar value is required for scalar division');
    }
    return this.matrixService.divideByScalar(operation.matrixA, operation.scalar);
  }

  @Post('transpose')
  @ApiOperation({ summary: 'Transpose matrix' })
  @ApiResponse({ status: 201, description: 'Matrix transposed', type: MatrixResultDto })
  transposeMatrix(@Body(ValidationPipe) body: { matrix: MatrixDto }): MatrixResultDto {
    return this.matrixService.transposeMatrix(body.matrix);
  }

  @Post('trace')
  @ApiOperation({ summary: 'Calculate matrix trace' })
  @ApiResponse({ status: 201, description: 'Matrix trace calculated' })
  calculateTrace(@Body(ValidationPipe) body: { matrix: MatrixDto }): { trace: number; matrix: MatrixDto } {
    return this.matrixService.calculateTrace(body.matrix);
  }

  @Post('determinant')
  @ApiOperation({ summary: 'Calculate matrix determinant' })
  @ApiResponse({ status: 201, description: 'Matrix determinant calculated' })
  calculateDeterminant(@Body(ValidationPipe) body: { matrix: MatrixDto }): { determinant: number; matrix: MatrixDto } {
    return this.matrixService.calculateDeterminant(body.matrix);
  }

  @Post('eigenvalues')
  @ApiOperation({ summary: 'Calculate dominant eigenvalue and eigenvector' })
  @ApiResponse({ status: 201, description: 'Eigenvalues calculated', type: EigenvalueResultDto })
  calculateEigenvalues(@Body(ValidationPipe) body: { matrix: MatrixDto }): EigenvalueResultDto {
    return this.matrixService.calculateEigenvalues(body.matrix);
  }

  @Post('info')
  @ApiOperation({ summary: 'Get matrix information and properties' })
  @ApiResponse({ status: 201, description: 'Matrix information retrieved' })
  getMatrixInfo(@Body(ValidationPipe) body: { matrix: MatrixDto }): {
    matrix: MatrixDto;
    properties: {
      rows: number;
      cols: number;
      shape: [number, number];
      isSquare: boolean;
      size: number;
    };
  } {
    return this.matrixService.getMatrixInfo(body.matrix);
  }

  @Post('clone')
  @ApiOperation({ summary: 'Clone matrix' })
  @ApiResponse({ status: 201, description: 'Matrix cloned', type: MatrixResultDto })
  cloneMatrix(@Body(ValidationPipe) body: { matrix: MatrixDto }): MatrixResultDto {
    return this.matrixService.cloneMatrix(body.matrix);
  }

  @Post('equals')
  @ApiOperation({ summary: 'Check if two matrices are equal' })
  @ApiQuery({ name: 'tolerance', description: 'Tolerance for floating point comparison', example: 1e-10, required: false })
  @ApiResponse({ status: 201, description: 'Matrix equality checked' })
  areMatricesEqual(
    @Body(ValidationPipe) body: { matrixA: MatrixDto; matrixB: MatrixDto },
    @Query('tolerance') tolerance?: string
  ): {
    equal: boolean;
    matrixA: MatrixDto;
    matrixB: MatrixDto;
    tolerance: number;
  } {
    const tol = tolerance ? parseFloat(tolerance) : 1e-10;
    return this.matrixService.areMatricesEqual(body.matrixA, body.matrixB, tol);
  }
}
