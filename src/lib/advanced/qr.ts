import { Matrix } from '../matrix';

/**
 * QR Decomposition using Householder transformations
 * A = Q * R where Q is orthogonal and R is upper triangular
 */
export class QR {
  private Q: Matrix | null = null;
  private R: Matrix | null = null;

  /**
   * Compute QR decomposition using Householder transformations
   * @param A Input matrix (m x n)
   */
  decompose(A: Matrix): void {
    const m = A.rows;
    const n = A.cols;
    const k = Math.min(m, n);

    // Initialize Q as identity matrix (m x k)
    const identityData: number[][] = [];
    for (let i = 0; i < m; i++) {
      const row: number[] = [];
      for (let j = 0; j < k; j++) {
        row.push(i === j ? 1 : 0);
      }
      identityData.push(row);
    }
    this.Q = new Matrix(identityData);

    // Initialize R as k x n matrix
    const rData: number[][] = [];
    for (let i = 0; i < k; i++) {
      rData.push(A.getRow(i));
    }
    this.R = new Matrix(rData);

    for (let j = 0; j < k; j++) {
      // Extract the j-th column of R from diagonal downward
      const column = this._extractColumnFromDiagonal(this.R, j);

      if (column.rows > 1) {
        // Compute Householder vector and transformation
        const { v, beta } = this._householderVector(column);

        // Apply Householder transformation to R
        this.R = this._applyHouseholderToMatrix(this.R, v, beta, j);

        // Apply Householder transformation to Q
        this.Q = this._applyHouseholderToMatrix(this.Q, v, beta, j);
      }
    }

    // Q should be orthogonal, but due to numerical errors, we may need to adjust
    this._ensureOrthogonality();
  }

  /**
   * Get orthogonal matrix Q
   */
  getQ(): Matrix {
    if (!this.Q) {
      throw new Error('QR decomposition not performed yet');
    }
    return this.Q.clone();
  }

  /**
   * Get upper triangular matrix R
   */
  getR(): Matrix {
    if (!this.R) {
      throw new Error('QR decomposition not performed yet');
    }
    return this.R.clone();
  }

  /**
   * Solve linear system A * x = b using QR decomposition
   * @param b Right-hand side vector/matrix
   * @returns Solution x
   */
  solve(b: Matrix): Matrix {
    if (!this.Q || !this.R) {
      throw new Error('QR decomposition not performed yet');
    }

    // A * x = b => Q * R * x = b => R * x = Q^T * b
    const QTb = this.Q.transpose().multiply(b);
    return this._backSubstitution(this.R, QTb);
  }

  /**
   * Compute determinant of original matrix (product of diagonal elements of R)
   */
  determinant(): number {
    if (!this.R) {
      throw new Error('QR decomposition not performed yet');
    }

    let det = 1;
    const minDim = Math.min(this.R.rows, this.R.cols);
    for (let i = 0; i < minDim; i++) {
      det *= this.R.get(i, i);
    }
    return det;
  }

  /**
   * Compute rank based on diagonal elements of R
   * @param threshold Numerical threshold
   */
  rank(threshold: number = 1e-12): number {
    if (!this.R) {
      throw new Error('QR decomposition not performed yet');
    }

    let rank = 0;
    const minDim = Math.min(this.R.rows, this.R.cols);
    for (let i = 0; i < minDim; i++) {
      if (Math.abs(this.R.get(i, i)) > threshold) {
        rank++;
      }
    }
    return rank;
  }

  /**
   * Extract column from diagonal downward in R matrix
   */
  private _extractColumnFromDiagonal(R: Matrix, col: number): Matrix {
    const startRow = col;
    const columnData: number[][] = [];

    for (let i = startRow; i < R.rows; i++) {
      columnData.push([R.get(i, col)]);
    }

    return new Matrix(columnData);
  }

  /**
   * Compute Householder vector for given column
   * Returns {v, beta} where H = I - beta * v * v^T
   */
  private _householderVector(x: Matrix): { v: Matrix; beta: number } {
    const m = x.rows;
    const sigma = this._computeSigma(x);

    // x[0] + sign(x[0]) * ||x||
    const x0 = x.get(0, 0);
    const normX = Math.sqrt(x0 * x0 + sigma);
    const v0 = x0 >= 0 ? -(x0 + normX) : x0 - normX;

    // Householder vector v
    const v = Matrix.zeros(m, 1);
    v.set(0, 0, v0);

    // Copy remaining elements
    for (let i = 1; i < m; i++) {
      v.set(i, 0, x.get(i, 0));
    }

    // Normalize v
    const beta = sigma === 0 && v0 === 0 ? 0 : 2 / (v0 * v0 + sigma);

    return { v, beta };
  }

  /**
   * Compute sigma = ||x[1:]||^2
   */
  private _computeSigma(x: Matrix): number {
    let sigma = 0;
    for (let i = 1; i < x.rows; i++) {
      const val = x.get(i, 0);
      sigma += val * val;
    }
    return sigma;
  }

  /**
   * Apply Householder transformation to matrix
   * H * A where H = I - beta * v * v^T
   */
  private _applyHouseholderToMatrix(
    A: Matrix,
    v: Matrix,
    beta: number,
    startCol: number,
  ): Matrix {
    if (beta === 0) {
      return A.clone();
    }

    // Compute w = beta * A^T * v (only for columns >= startCol)
    const w = Matrix.zeros(A.cols, 1);

    for (let j = startCol; j < A.cols; j++) {
      let sum = 0;
      for (let i = startCol; i < A.rows; i++) {
        sum += A.get(i, j) * v.get(i - startCol, 0);
      }
      w.set(j, 0, beta * sum);
    }

    // Update A: A = A - v * w^T
    const result = A.clone();

    for (let i = startCol; i < A.rows; i++) {
      for (let j = startCol; j < A.cols; j++) {
        const update = v.get(i - startCol, 0) * w.get(j, 0);
        result.set(i, j, A.get(i, j) - update);
      }
    }

    return result;
  }

  /**
   * Ensure Q is orthogonal (fix numerical errors)
   */
  private _ensureOrthogonality(): void {
    if (!this.Q) return;

    // In practice, you might want to use more sophisticated orthogonalization
    // For now, we'll assume the Householder transformations maintain orthogonality
  }

  /**
   * Solve upper triangular system R * x = b using back substitution
   */
  private _backSubstitution(R: Matrix, b: Matrix): Matrix {
    const n = R.cols;
    const x = Matrix.zeros(n, b.cols);

    for (let k = b.cols - 1; k >= 0; k--) {
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
          sum += R.get(i, j) * x.get(j, k);
        }
        x.set(i, k, (b.get(i, k) - sum) / R.get(i, i));
      }
    }

    return x;
  }

  /**
   * Static method to perform QR decomposition
   * @param A Input matrix
   * @returns {Q, R} decomposition
   */
  static decompose(A: Matrix): { Q: Matrix; R: Matrix } {
    const qr = new QR();
    qr.decompose(A);
    return { Q: qr.getQ(), R: qr.getR() };
  }

  /**
   * Static method to solve linear system using QR
   * @param A Coefficient matrix
   * @param b Right-hand side
   * @returns Solution
   */
  static solve(A: Matrix, b: Matrix): Matrix {
    const qr = new QR();
    qr.decompose(A);
    return qr.solve(b);
  }
}
