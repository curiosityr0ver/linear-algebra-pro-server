import { IsArray, IsNumber, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
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
}
