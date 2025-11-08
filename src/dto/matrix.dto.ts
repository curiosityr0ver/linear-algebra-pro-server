import { IsArray, IsNumber, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatrixDto {
  @ApiProperty({
    description: '2D array representing the matrix',
    example: [[1, 2, 3], [4, 5, 6]]
  })
  @IsArray()
  data: number[][];

  @ApiPropertyOptional({
    description: 'Number of rows',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  rows?: number;

  @ApiPropertyOptional({
    description: 'Number of columns',
    example: 3
  })
  @IsOptional()
  @IsNumber()
  cols?: number;

  @ApiPropertyOptional({
    description: 'Matrix shape as [rows, cols]',
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
    type: MatrixDto
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  matrixA: MatrixDto;

  @ApiProperty({
    description: 'Second matrix (for binary operations)',
    type: MatrixDto,
    required: false
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
