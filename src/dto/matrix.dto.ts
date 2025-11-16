import { IsArray, IsNumber, ValidateNested, ArrayMinSize, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatrixDto {
  @ApiProperty({
    description: '2D array representing the matrix. rows, cols, and shape are optional and will be inferred from data if not provided.',
    example: [[1, 2, 3], [4, 5, 6]]
  })
  @IsArray()
  data: number[][];

  @ApiPropertyOptional({
    description: 'Number of rows (optional - inferred from data if not provided)',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  rows?: number;

  @ApiPropertyOptional({
    description: 'Number of columns (optional - inferred from data if not provided)',
    example: 3
  })
  @IsOptional()
  @IsNumber()
  cols?: number;

  @ApiPropertyOptional({
    description: 'Matrix shape as [rows, cols] (optional - inferred from data if not provided)',
    example: [2, 3]
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  shape?: [number, number];
}

export class MatrixOperationDto {
  @ApiProperty({
    description: 'First matrix',
    type: MatrixDto,
    example: {
      data: [[1, 2, 3], [4, 5, 6]]
    }
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrixA: MatrixDto;

  @ApiProperty({
    description: 'Second matrix (for binary operations). For multiplication: if matrixA is m×n, matrixB must be n×p. Example: 2×3 × 3×2 = 2×2',
    type: MatrixDto,
    required: false,
    example: {
      data: [[7, 8], [9, 10], [11, 12]]
    }
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MatrixDto)
  matrixB?: MatrixDto;

  @ApiPropertyOptional({
    description: 'Scalar value for scalar operations',
    example: 2.5
  })
  @IsOptional()
  @IsNumber()
  scalar?: number;
}

export class EigenvalueOptionsDto {
  @ApiPropertyOptional({
    description: 'Maximum iterations for the power iteration algorithm',
    example: 500,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxIterations?: number = 1000;

  @ApiPropertyOptional({
    description: 'Convergence tolerance for the power iteration algorithm',
    example: 1e-8,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tolerance?: number = 1e-10;
}

export class EigenvalueOperationDto {
  @ApiProperty({
    description: 'Matrix to analyze',
    type: MatrixDto
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrix: MatrixDto;

  @ApiPropertyOptional({
    description: 'Optional settings for the power iteration algorithm',
    type: EigenvalueOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EigenvalueOptionsDto)
  options?: EigenvalueOptionsDto;
}

export class MatrixResultDto {
  @ApiProperty({
    description: 'Result matrix',
    type: MatrixDto
  })
  result: MatrixDto;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: { operation: 'add', shape: [2, 2] }
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EigenvalueResultDto {
  @ApiProperty({
    description: 'Eigenvalue',
    example: 2.5
  })
  eigenvalue: number;

  @ApiProperty({
    description: 'Eigenvector',
    type: MatrixDto
  })
  eigenvector: MatrixDto;

  @ApiProperty({
    description: 'Number of power-iteration steps that were executed',
    example: 42
  })
  iterations: number;

  @ApiProperty({
    description: 'Whether convergence was detected before reaching maxIterations',
    example: true
  })
  converged: boolean;

  @ApiProperty({
    description: 'Tolerance that was used for convergence checking',
    example: 1e-8
  })
  tolerance: number;

  @ApiProperty({
    description: 'Maximum iterations allowed for the computation',
    example: 1000
  })
  maxIterations: number;
}
