import { Matrix } from '../matrix';

/**
 * Singular Value Decomposition (SVD)
 * A = U * Σ * V^T
 */
export class SVD {
  private U: Matrix | null = null;
  private Sigma: Matrix | null = null;
  private VT: Matrix | null = null;

  /**
   * Compute SVD of a matrix using iterative methods
   * @param A Input matrix
   * @param maxIterations Maximum iterations for convergence
   * @param tolerance Convergence tolerance
   */
  decompose(
    A: Matrix,
    maxIterations: number = 100,
    tolerance: number = 1e-10,
  ): void {
    const m = A.rows;
    const n = A.cols;
    const k = Math.min(m, n);

    // Initialize U, Σ, V^T
    this.U = Matrix.zeros(m, k);
    this.Sigma = Matrix.zeros(k, k);
    this.VT = Matrix.zeros(k, n);

    // For simplicity, use a basic iterative method
    // In practice, you might want to use more sophisticated algorithms like Golub-Kahan-Lanczos

    for (let i = 0; i < k; i++) {
      // Find dominant right singular vector (power iteration on A^T * A)
      const ATA = A.transpose().multiply(A);
      const { eigenvalue: sigmaSquared, eigenvector: v } = this._powerIteration(
        ATA,
        maxIterations,
        tolerance,
      );

      const sigma = Math.sqrt(Math.max(0, sigmaSquared));
      this.Sigma.set(i, i, sigma);

      // Store right singular vector
      for (let j = 0; j < n; j++) {
        this.VT.set(i, j, v.get(j, 0));
      }

      if (sigma > tolerance) {
        // Compute left singular vector: u = (A * v) / σ
        const Av = A.multiply(v);
        const u = Av.divideScalar(sigma);

        // Store left singular vector
        for (let j = 0; j < m; j++) {
          this.U.set(j, i, u.get(j, 0));
        }

        // Deflate: A = A - σ * u * v^T
        const outerProduct = u.multiply(v.transpose());
        const deflation = outerProduct.multiplyScalar(sigma);
        A = A.subtract(deflation);
      } else {
        // Fill with zeros for numerical stability
        for (let j = 0; j < m; j++) {
          this.U.set(j, i, j === i ? 1 : 0);
        }
      }
    }
  }

  /**
   * Get left singular vectors U
   */
  getU(): Matrix {
    if (!this.U) {
      throw new Error('SVD decomposition not performed yet');
    }
    return this.U.clone();
  }

  /**
   * Get singular values Σ (as diagonal matrix)
   */
  getSigma(): Matrix {
    if (!this.Sigma) {
      throw new Error('SVD decomposition not performed yet');
    }
    return this.Sigma.clone();
  }

  /**
   * Get singular values as array
   */
  getSingularValues(): number[] {
    if (!this.Sigma) {
      throw new Error('SVD decomposition not performed yet');
    }
    const values: number[] = [];
    for (let i = 0; i < Math.min(this.Sigma.rows, this.Sigma.cols); i++) {
      values.push(this.Sigma.get(i, i));
    }
    return values;
  }

  /**
   * Get right singular vectors V^T
   */
  getVT(): Matrix {
    if (!this.VT) {
      throw new Error('SVD decomposition not performed yet');
    }
    return this.VT.clone();
  }

  /**
   * Get right singular vectors V (transpose of V^T)
   */
  getV(): Matrix {
    if (!this.VT) {
      throw new Error('SVD decomposition not performed yet');
    }
    return this.VT.transpose();
  }

  /**
   * Reconstruct original matrix from SVD components
   * @param k Number of singular values to use (for low-rank approximation)
   */
  reconstruct(k?: number): Matrix {
    if (!this.U || !this.Sigma || !this.VT) {
      throw new Error('SVD decomposition not performed yet');
    }

    const rank = k || Math.min(this.U.cols, this.Sigma.rows, this.VT.rows);

    // Extract first k columns of U, first k singular values, first k rows of V^T
    const Uk = this._extractColumns(this.U, rank);
    const SigmaK = this._extractDiagonal(this.Sigma, rank);
    const VTk = this._extractRows(this.VT, rank);

    // Reconstruct: U_k * Σ_k * V^T_k
    const temp = Uk.multiply(SigmaK);
    return temp.multiply(VTk);
  }

  /**
   * Compute condition number (largest singular value / smallest non-zero singular value)
   */
  conditionNumber(): number {
    const singularValues = this.getSingularValues();
    const nonZeroValues = singularValues.filter((val) => val > 1e-12);

    if (nonZeroValues.length === 0) {
      return Infinity;
    }

    const max = Math.max(...nonZeroValues);
    const min = Math.min(...nonZeroValues);

    return max / min;
  }

  /**
   * Compute rank based on numerical threshold
   * @param threshold Numerical threshold for considering singular values as zero
   */
  numericalRank(threshold: number = 1e-12): number {
    const singularValues = this.getSingularValues();
    return singularValues.filter((val) => val > threshold).length;
  }

  /**
   * Power iteration method for finding dominant eigenvalue/eigenvector
   */
  private _powerIteration(
    A: Matrix,
    maxIter: number,
    tol: number,
  ): { eigenvalue: number; eigenvector: Matrix } {
    // Initialize random vector
    const v = Matrix.zeros(A.cols, 1);
    for (let i = 0; i < A.cols; i++) {
      v.set(i, 0, Math.random());
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < v.rows; i++) {
      norm += v.get(i, 0) * v.get(i, 0);
    }
    norm = Math.sqrt(norm);
    for (let i = 0; i < v.rows; i++) {
      v.set(i, 0, v.get(i, 0) / norm);
    }

    let eigenvalue = 0;
    let prevEigenvalue = 0;

    for (let iter = 0; iter < maxIter; iter++) {
      // v_{k+1} = A * v_k
      const Av = A.multiply(v);

      // Rayleigh quotient: λ = v^T * A * v
      eigenvalue = 0;
      norm = 0;
      for (let i = 0; i < v.rows; i++) {
        eigenvalue += v.get(i, 0) * Av.get(i, 0);
        norm += Av.get(i, 0) * Av.get(i, 0);
      }

      // Normalize: v_{k+1} = A*v_k / ||A*v_k||
      norm = Math.sqrt(norm);
      for (let i = 0; i < v.rows; i++) {
        v.set(i, 0, Av.get(i, 0) / norm);
      }

      // Check convergence
      if (Math.abs(eigenvalue - prevEigenvalue) < tol) {
        break;
      }
      prevEigenvalue = eigenvalue;
    }

    return { eigenvalue, eigenvector: v };
  }

  /**
   * Extract first k columns from matrix
   */
  private _extractColumns(A: Matrix, k: number): Matrix {
    const cols = Math.min(k, A.cols);
    const data: number[][] = [];

    for (let i = 0; i < A.rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(A.get(i, j));
      }
      data.push(row);
    }

    return new Matrix(data);
  }

  /**
   * Extract first k rows from matrix
   */
  private _extractRows(A: Matrix, k: number): Matrix {
    const rows = Math.min(k, A.rows);
    const data: number[][] = [];

    for (let i = 0; i < rows; i++) {
      data.push(A.getRow(i));
    }

    return new Matrix(data);
  }

  /**
   * Extract k x k diagonal matrix from larger diagonal matrix
   */
  private _extractDiagonal(A: Matrix, k: number): Matrix {
    const size = Math.min(k, Math.min(A.rows, A.cols));
    const result = Matrix.zeros(size, size);

    for (let i = 0; i < size; i++) {
      result.set(i, i, A.get(i, i));
    }

    return result;
  }
}
