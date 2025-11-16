import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { MatrixService } from './matrix.service';
import {
  MatrixDto,
  MatrixResultDto,
  EigenvalueResultDto,
  MatrixOperationDto,
  EigenvalueOperationDto
} from '../dto';

@ApiTags('Matrix Operations')
@Controller('matrix')
export class MatrixController {
  constructor(private readonly matrixService: MatrixService) {}

  @Post('create/identity/:size')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create identity matrix' })
  @ApiParam({ name: 'size', description: 'Size of the square identity matrix', example: 3 })
  @ApiResponse({ status: 200, description: 'Identity matrix created', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure size is a positive integer.'
  })
  createIdentity(@Param('size', ParseIntPipe) size: number): MatrixResultDto {
    return this.matrixService.createIdentity(size);
  }

  @Post('create/zeros')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create zeros matrix' })
  @ApiQuery({ name: 'rows', description: 'Number of rows', example: 2 })
  @ApiQuery({ name: 'cols', description: 'Number of columns', example: 3 })
  @ApiResponse({ status: 200, description: 'Zeros matrix created', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure rows and cols are positive integers.'
  })
  createZeros(
    @Query('rows', ParseIntPipe) rows: number,
    @Query('cols', ParseIntPipe) cols: number
  ): MatrixResultDto {
    return this.matrixService.createZeros(rows, cols);
  }

  @Post('create/ones')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create ones matrix' })
  @ApiQuery({ name: 'rows', description: 'Number of rows', example: 2 })
  @ApiQuery({ name: 'cols', description: 'Number of columns', example: 3 })
  @ApiResponse({ status: 200, description: 'Ones matrix created', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure rows and cols are positive integers.'
  })
  createOnes(
    @Query('rows', ParseIntPipe) rows: number,
    @Query('cols', ParseIntPipe) cols: number
  ): MatrixResultDto {
    return this.matrixService.createOnes(rows, cols);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add two matrices' })
  @ApiResponse({ status: 200, description: 'Matrices added', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Matrices must have matching shapes and matrixB is required.'
  })
  addMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for addition');
    }
    return this.matrixService.addMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('subtract')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subtract two matrices' })
  @ApiResponse({ status: 200, description: 'Matrices subtracted', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Matrices must have matching shapes and matrixB is required.'
  })
  subtractMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for subtraction');
    }
    return this.matrixService.subtractMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('multiply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Multiply two matrices' })
  @ApiResponse({ status: 200, description: 'Matrices multiplied', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'matrixB is required and inner dimensions must align for multiplication.'
  })
  multiplyMatrices(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (!operation.matrixB) {
      throw new BadRequestException('Second matrix (matrixB) is required for multiplication');
    }
    return this.matrixService.multiplyMatrices(operation.matrixA, operation.matrixB);
  }

  @Post('multiply-scalar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Multiply matrix by scalar' })
  @ApiResponse({ status: 200, description: 'Matrix multiplied by scalar', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Scalar value is required and must be numeric.'
  })
  multiplyByScalar(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (operation.scalar === undefined) {
      throw new BadRequestException('Scalar value is required for scalar multiplication');
    }
    return this.matrixService.multiplyByScalar(operation.matrixA, operation.scalar);
  }

  @Post('divide-scalar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Divide matrix by scalar' })
  @ApiResponse({ status: 200, description: 'Matrix divided by scalar', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Scalar value is required, must be numeric, and cannot be zero.'
  })
  divideByScalar(@Body(ValidationPipe) operation: MatrixOperationDto): MatrixResultDto {
    if (operation.scalar === undefined) {
      throw new BadRequestException('Scalar value is required for scalar division');
    }
    return this.matrixService.divideByScalar(operation.matrixA, operation.scalar);
  }

  @Post('transpose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transpose matrix' })
  @ApiResponse({ status: 200, description: 'Matrix transposed', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure matrix payload is valid.'
  })
  transposeMatrix(@Body(ValidationPipe) body: { matrix: MatrixDto }): MatrixResultDto {
    return this.matrixService.transposeMatrix(body.matrix);
  }

  @Post('trace')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate matrix trace' })
  @ApiResponse({ status: 200, description: 'Matrix trace calculated' })
  @ApiBadRequestResponse({
    description: 'Trace is only defined for square matrices.'
  })
  calculateTrace(@Body(ValidationPipe) body: { matrix: MatrixDto }): { trace: number; matrix: MatrixDto } {
    return this.matrixService.calculateTrace(body.matrix);
  }

  @Post('determinant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate matrix determinant' })
  @ApiResponse({ status: 200, description: 'Matrix determinant calculated' })
  @ApiBadRequestResponse({
    description: 'Determinant is only defined for square matrices.'
  })
  calculateDeterminant(@Body(ValidationPipe) body: { matrix: MatrixDto }): { determinant: number; matrix: MatrixDto } {
    return this.matrixService.calculateDeterminant(body.matrix);
  }

  @Post('eigenvalues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate dominant eigenvalue and eigenvector' })
  @ApiBody({ type: EigenvalueOperationDto })
  @ApiResponse({ status: 200, description: 'Eigenvalues calculated', type: EigenvalueResultDto })
  @ApiBadRequestResponse({
    description: 'Ensure the matrix is square and numerically stable for power iteration.'
  })
  calculateEigenvalues(@Body(ValidationPipe) body: EigenvalueOperationDto): EigenvalueResultDto {
    return this.matrixService.calculateEigenvalues(body);
  }

  @Post('info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get matrix information and properties' })
  @ApiResponse({ status: 200, description: 'Matrix information retrieved' })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure matrix payload is valid.'
  })
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clone matrix' })
  @ApiResponse({ status: 200, description: 'Matrix cloned', type: MatrixResultDto })
  @ApiBadRequestResponse({
    description: 'Validation failed. Ensure matrix payload is valid.'
  })
  cloneMatrix(@Body(ValidationPipe) body: { matrix: MatrixDto }): MatrixResultDto {
    return this.matrixService.cloneMatrix(body.matrix);
  }

  @Post('equals')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if two matrices are equal' })
  @ApiQuery({ name: 'tolerance', description: 'Tolerance for floating point comparison', example: 1e-10, required: false })
  @ApiResponse({ status: 200, description: 'Matrix equality checked' })
  @ApiBadRequestResponse({
    description: 'Validation failed. Provide both matrices for comparison.'
  })
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
