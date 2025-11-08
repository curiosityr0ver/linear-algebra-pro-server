import { IsArray, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatrixDto } from './matrix.dto';

export class PCATrainDto {
  @ApiProperty({
    description: 'Training data matrix (n_samples x n_features)',
    example: [[1, 2], [3, 4], [5, 6], [7, 8]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  X: MatrixDto;

  @ApiPropertyOptional({
    description: 'Number of principal components to keep. If not specified, keeps all components.',
    example: 2,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  nComponents?: number;
}

export class PCAResultDto {
  @ApiProperty({
    description: 'Transformed data in principal component space',
    type: MatrixDto
  })
  X_transformed: MatrixDto;

  @ApiProperty({
    description: 'Principal components (eigenvectors)',
    type: MatrixDto
  })
  components: MatrixDto;

  @ApiProperty({
    description: 'Explained variance for each component',
    example: [2.5, 1.2, 0.3]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  explained_variance: number[];

  @ApiProperty({
    description: 'Explained variance ratio for each component',
    example: [0.625, 0.3, 0.075]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  explained_variance_ratio: number[];

  @ApiProperty({
    description: 'Number of components used',
    example: 2
  })
  n_components: number;
}

export class PCATransformDto {
  @ApiProperty({
    description: 'Data to transform (must have same number of features as training data)',
    example: [[1.5, 2.5], [3.5, 4.5]]
  })
  @ValidateNested()
  @Type(() => MatrixDto)
  X: MatrixDto;
}
