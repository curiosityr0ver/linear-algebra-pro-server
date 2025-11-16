import { BadRequestException, Injectable } from '@nestjs/common';
import { PCA, SVD, QR } from '../lib';
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

@Injectable()
export class AdvancedService {
  /**
   * Convert 2D array to Matrix
   */
  private arrayToMatrix(data: number[][]) {
    const { Matrix } = require('../lib');
    return new Matrix(data);
  }

  /**
   * Convert Matrix to 2D array
   */
  private matrixToArray(matrix: any): number[][] {
    return matrix.data;
  }

  /**
   * Create MatrixDto from Matrix
   */
  private matrixToDto(matrix: any) {
    return {
      data: this.matrixToArray(matrix),
      rows: matrix.rows,
      cols: matrix.cols,
      shape: matrix.shape
    };
  }

  /**
   * Perform PCA training
   */
  performPCA(trainingData: PCATrainDto): PCAResultDto {
    const X = this.arrayToMatrix(trainingData.X.data);
    const pca = new PCA();

    const X_transformed = pca.fitTransform(X, trainingData.nComponents);

    return {
      X_transformed: this.matrixToDto(X_transformed),
      components: this.matrixToDto(pca.getComponents()),
      mean: this.matrixToDto(pca.getMean()),
      explained_variance: pca.getExplainedVariance(),
      explained_variance_ratio: pca.getExplainedVarianceRatio(),
      n_components: trainingData.nComponents || pca.getComponents().cols
    };
  }

  /**
   * Transform data using trained PCA
   */
  transformWithPCA(transformData: PCATransformDto, trainedPCA: PCAResultDto): { X_transformed: any } {
    if (!trainedPCA.mean) {
      throw new BadRequestException(
        'trainedPCA.mean is missing. Retrain the PCA model after upgrading the server to include mean metadata.'
      );
    }

    const meanMatrix = this.arrayToMatrix(trainedPCA.mean.data);
    const componentsMatrix = this.arrayToMatrix(trainedPCA.components.data);
    const X_test = this.arrayToMatrix(transformData.X.data);

    if (meanMatrix.rows !== 1) {
      throw new BadRequestException('trainedPCA.mean must be a single-row matrix');
    }

    if (X_test.cols !== meanMatrix.cols) {
      throw new BadRequestException(`Input data has ${X_test.cols} features, expected ${meanMatrix.cols}`);
    }

    const centeredData: number[][] = [];
    for (let i = 0; i < X_test.rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < X_test.cols; j++) {
        row.push(X_test.get(i, j) - meanMatrix.get(0, j));
      }
      centeredData.push(row);
    }

    const X_centered = this.arrayToMatrix(centeredData);
    const X_transformed = X_centered.multiply(componentsMatrix.transpose());

    return {
      X_transformed: this.matrixToDto(X_transformed)
    };
  }

  /**
   * Perform SVD decomposition
   */
  performSVD(svdData: SVDDto): SVDResultDto {
    const matrix = this.arrayToMatrix(svdData.matrix.data);
    const svd = new SVD();

    svd.decompose(matrix, svdData.maxIterations, svdData.tolerance);

    return {
      U: this.matrixToDto(svd.getU()),
      Sigma: this.matrixToDto(svd.getSigma()),
      VT: this.matrixToDto(svd.getVT()),
      singular_values: svd.getSingularValues(),
      condition_number: svd.conditionNumber(),
      numerical_rank: svd.numericalRank()
    };
  }

  /**
   * Perform low-rank SVD reconstruction
   */
  reconstructWithSVD(reconstructData: SVDReconstructDto): SVDReconstructResultDto {
    const matrix = this.arrayToMatrix(reconstructData.matrix.data);
    const svd = new SVD();

    svd.decompose(matrix);
    const reconstruction = svd.reconstruct(reconstructData.k);

    return {
      reconstruction: this.matrixToDto(reconstruction),
      rank: reconstructData.k
    };
  }

  /**
   * Perform QR decomposition
   */
  performQR(qrData: QRDto): QRResultDto {
    const matrix = this.arrayToMatrix(qrData.matrix.data);
    const qr = new QR();

    qr.decompose(matrix);

    return {
      Q: this.matrixToDto(qr.getQ()),
      R: this.matrixToDto(qr.getR()),
      determinant: qr.determinant(),
      rank: qr.rank()
    };
  }

  /**
   * Solve linear system using QR decomposition
   */
  solveWithQR(solveData: QRSolveDto): QRSolveResultDto {
    const A = this.arrayToMatrix(solveData.A.data);
    const b = this.arrayToMatrix(solveData.b.data);
    const solution = QR.solve(A, b);

    // Verification: A * x
    const verification = A.multiply(solution);

    return {
      solution: this.matrixToDto(solution),
      verification: this.matrixToDto(verification)
    };
  }
}
