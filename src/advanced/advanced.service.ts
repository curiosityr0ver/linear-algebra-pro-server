import { Injectable } from '@nestjs/common';
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
      explained_variance: pca.getExplainedVariance(),
      explained_variance_ratio: pca.getExplainedVarianceRatio(),
      n_components: trainingData.nComponents || pca.getComponents().cols
    };
  }

  /**
   * Transform data using trained PCA
   */
  transformWithPCA(transformData: PCATransformDto, trainedPCA: PCAResultDto): { X_transformed: any } {
    // For simplicity, we'll retrain PCA. In a real application, you'd store the trained model.
    const X_train = this.arrayToMatrix(trainedPCA.X_transformed.data.map(row => row.slice(0, trainedPCA.components.cols)));
    const pca = new PCA();
    pca.fit(X_train, trainedPCA.n_components);

    const X_test = this.arrayToMatrix(transformData.X.data);
    const X_transformed = pca.transform(X_test);

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
