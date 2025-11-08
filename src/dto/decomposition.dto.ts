import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatrixDto } from './matrix.dto';

export class SVDDto {
  @ApiProperty({
    description: 'Input matrix to decompose',
    example: [[4, 0, 2], [0, 3, -1], [2, -1, 1]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrix: MatrixDto;

  @ApiPropertyOptional({
    description: 'Maximum iterations for convergence',
    example: 100,
    default: 100,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  maxIterations?: number = 100;

  @ApiPropertyOptional({
    description: 'Convergence tolerance',
    example: 1e-10,
    default: 1e-10,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  tolerance?: number = 1e-10;
}

export class SVDResultDto {
  @ApiProperty({
    description: 'Left singular vectors U',
    type: MatrixDto
  })
  U: MatrixDto;

  @ApiProperty({
    description: 'Singular values (diagonal matrix Σ)',
    type: MatrixDto
  })
  Sigma: MatrixDto;

  @ApiProperty({
    description: 'Right singular vectors V^T',
    type: MatrixDto
  })
  VT: MatrixDto;

  @ApiProperty({
    description: 'Singular values as array',
    example: [5.103, 3.146, 0.249]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  singular_values: number[];

  @ApiProperty({
    description: 'Condition number of the matrix',
    example: 20.482
  })
  condition_number: number;

  @ApiProperty({
    description: 'Numerical rank of the matrix',
    example: 3
  })
  numerical_rank: number;
}

export class SVDReconstructDto {
  @ApiProperty({
    description: 'Input matrix to decompose',
    example: [[4, 0, 2], [0, 3, -1], [2, -1, 1]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrix: MatrixDto;

  @ApiProperty({
    description: 'Number of singular values to keep for reconstruction',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  k: number;
}

export class SVDReconstructResultDto {
  @ApiProperty({
    description: 'Low-rank approximation of the original matrix',
    type: MatrixDto
  })
  reconstruction: MatrixDto;

  @ApiProperty({
    description: 'Rank used for reconstruction',
    example: 2
  })
  rank: number;
}

export class QRDto {
  @ApiProperty({
    description: 'Input matrix to decompose (must be square)',
    example: [[1, 1], [1, 0]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrix: MatrixDto;
}

export class QRResultDto {
  @ApiProperty({
    description: 'Orthogonal matrix Q',
    type: MatrixDto
  })
  Q: MatrixDto;

  @ApiProperty({
    description: 'Upper triangular matrix R',
    type: MatrixDto
  })
  R: MatrixDto;

  @ApiProperty({
    description: 'Determinant of the original matrix',
    example: -2
  })
  determinant: number;

  @ApiProperty({
    description: 'Numerical rank of the matrix',
    example: 2
  })
  rank: number;
}

export class QRSolveDto {
  @ApiProperty({
    description: 'Coefficient matrix A',
    example: [[2, 1], [1, 2]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  A: MatrixDto;

  @ApiProperty({
    description: 'Right-hand side vector/matrix b',
    example: [[3], [3]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  b: MatrixDto;
}

export class QRSolveResultDto {
  @ApiProperty({
    description: 'Solution vector/matrix x such that A*x = b',
    type: MatrixDto
  })
  solution: MatrixDto;

  @ApiProperty({
    description: 'Verification: A*x result',
    type: MatrixDto
  })
  verification: MatrixDto;
}
