import { BadRequestException, Injectable } from '@nestjs/common';
import { Matrix } from '../lib';
import { MatrixDto, MatrixResultDto, EigenvalueResultDto, EigenvalueOperationDto } from '../dto';

@Injectable()
export class MatrixService {
  /**
   * Convert MatrixDto to Matrix
   */
  private dtoToMatrix(dto: MatrixDto): Matrix {
    return new Matrix(dto.data);
  }

  /**
   * Convert Matrix to MatrixDto
   */
  private matrixToDto(matrix: Matrix): MatrixDto {
    return {
      data: matrix.data,
      rows: matrix.rows,
      cols: matrix.cols,
      shape: matrix.shape
    };
  }

  /**
   * Wrap matrix operations to provide consistent BadRequest responses
   */
  private handleMatrixOperation<T>(operation: () => T): T {
    try {
      return operation();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  /**
   * Create identity matrix
   */
  createIdentity(size: number): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const matrix = Matrix.identity(size);
      return {
        result: this.matrixToDto(matrix),
        metadata: { operation: 'identity', size }
      };
    });
  }

  /**
   * Create zeros matrix
   */
  createZeros(rows: number, cols: number): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const matrix = Matrix.zeros(rows, cols);
      return {
        result: this.matrixToDto(matrix),
        metadata: { operation: 'zeros', rows, cols }
      };
    });
  }

  /**
   * Create ones matrix
   */
  createOnes(rows: number, cols: number): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const matrix = Matrix.ones(rows, cols);
      return {
        result: this.matrixToDto(matrix),
        metadata: { operation: 'ones', rows, cols }
      };
    });
  }

  /**
   * Add two matrices
   */
  addMatrices(matrixA: MatrixDto, matrixB: MatrixDto): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrixA);
      const B = this.dtoToMatrix(matrixB);
      const result = A.add(B);

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'add', shape: result.shape }
      };
    });
  }

  /**
   * Subtract two matrices
   */
  subtractMatrices(matrixA: MatrixDto, matrixB: MatrixDto): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrixA);
      const B = this.dtoToMatrix(matrixB);
      const result = A.subtract(B);

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'subtract', shape: result.shape }
      };
    });
  }

  /**
   * Multiply two matrices
   */
  multiplyMatrices(matrixA: MatrixDto, matrixB: MatrixDto): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrixA);
      const B = this.dtoToMatrix(matrixB);
      const result = A.multiply(B);

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'multiply', shape: result.shape }
      };
    });
  }

  /**
   * Multiply matrix by scalar
   */
  multiplyByScalar(matrix: MatrixDto, scalar: number): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const result = A.multiplyScalar(scalar);

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'multiply_scalar', scalar, shape: result.shape }
      };
    });
  }

  /**
   * Divide matrix by scalar
   */
  divideByScalar(matrix: MatrixDto, scalar: number): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const result = A.divideScalar(scalar);

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'divide_scalar', scalar, shape: result.shape }
      };
    });
  }

  /**
   * Transpose matrix
   */
  transposeMatrix(matrix: MatrixDto): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const result = A.transpose();

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'transpose', original_shape: A.shape, new_shape: result.shape }
      };
    });
  }

  /**
   * Calculate matrix trace
   */
  calculateTrace(matrix: MatrixDto): { trace: number; matrix: MatrixDto } {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const trace = A.trace();

      return {
        trace,
        matrix: this.matrixToDto(A)
      };
    });
  }

  /**
   * Calculate matrix determinant
   */
  calculateDeterminant(matrix: MatrixDto): { determinant: number; matrix: MatrixDto } {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const determinant = A.determinant();

      return {
        determinant,
        matrix: this.matrixToDto(A)
      };
    });
  }

  /**
   * Calculate dominant eigenvalue and eigenvector using power iteration
   */
  calculateEigenvalues(operation: EigenvalueOperationDto): EigenvalueResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(operation.matrix);
      const maxIterations = operation.options?.maxIterations ?? 1000;
      const tolerance = operation.options?.tolerance ?? 1e-10;
      const { eigenvalue, eigenvector, iterations, converged } = A.powerIteration(maxIterations, tolerance);

      return {
        eigenvalue,
        eigenvector: this.matrixToDto(eigenvector),
        iterations,
        converged,
        tolerance,
        maxIterations
      };
    });
  }

  /**
   * Get matrix properties
   */
  getMatrixInfo(matrix: MatrixDto): {
    matrix: MatrixDto;
    properties: {
      rows: number;
      cols: number;
      shape: [number, number];
      isSquare: boolean;
      size: number;
    };
  } {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);

      return {
        matrix: this.matrixToDto(A),
        properties: {
          rows: A.rows,
          cols: A.cols,
          shape: A.shape,
          isSquare: A.isSquare,
          size: A.rows * A.cols
        }
      };
    });
  }

  /**
   * Clone matrix
   */
  cloneMatrix(matrix: MatrixDto): MatrixResultDto {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrix);
      const result = A.clone();

      return {
        result: this.matrixToDto(result),
        metadata: { operation: 'clone', shape: result.shape }
      };
    });
  }

  /**
   * Check if two matrices are equal
   */
  areMatricesEqual(matrixA: MatrixDto, matrixB: MatrixDto, tolerance: number = 1e-10): {
    equal: boolean;
    matrixA: MatrixDto;
    matrixB: MatrixDto;
    tolerance: number;
  } {
    return this.handleMatrixOperation(() => {
      const A = this.dtoToMatrix(matrixA);
      const B = this.dtoToMatrix(matrixB);
      const equal = A.equals(B, tolerance);

      return {
        equal,
        matrixA: this.matrixToDto(A),
        matrixB: this.matrixToDto(B),
        tolerance
      };
    });
  }
}
