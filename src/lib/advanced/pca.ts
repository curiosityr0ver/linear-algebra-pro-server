import { Matrix } from '../matrix';

/**
 * Principal Component Analysis (PCA) implementation
 */
export class PCA {
  private components: Matrix | null = null;
  private explainedVariance: number[] = [];
  private explainedVarianceRatio: number[] = [];
  private mean: Matrix | null = null;

  /**
   * Fit PCA on the input data
   * @param X Input data matrix (n_samples x n_features)
   * @param nComponents Number of principal components to keep
   */
  fit(X: Matrix, nComponents?: number): void {
    if (X.rows < X.cols) {
      throw new Error(
        'Number of samples should be greater than number of features for PCA',
      );
    }

    // Center the data (subtract mean from each column)
    this.mean = this._computeMean(X);
    const XCentered = this._centerData(X, this.mean);

    // Compute covariance matrix
    const covariance = this._computeCovariance(XCentered);

    // Compute eigenvalues and eigenvectors
    const { eigenvalues, eigenvectors } =
      this._computeEigenDecomposition(covariance);

    // Sort by eigenvalues in descending order
    const sortedIndices = eigenvalues
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .map((item) => item.idx);

    const sortedEigenvalues = sortedIndices.map((idx) => eigenvalues[idx]);
    const sortedEigenvectors = this._sortEigenvectors(
      eigenvectors,
      sortedIndices,
    );

    // Store explained variance
    const totalVariance = sortedEigenvalues.reduce((sum, val) => sum + val, 0);
    this.explainedVariance = sortedEigenvalues.slice(
      0,
      nComponents || sortedEigenvalues.length,
    );
    this.explainedVarianceRatio = this.explainedVariance.map(
      (val) => val / totalVariance,
    );

    // Select number of components
    const numComponents =
      nComponents || Math.min(X.cols, sortedEigenvalues.length);
    this.components = sortedEigenvectors.transpose();

    // Keep only the first nComponents rows (principal components)
    const componentData: number[][] = [];
    for (let i = 0; i < numComponents; i++) {
      componentData.push(this.components.getRow(i));
    }
    this.components = new Matrix(componentData);
  }

  /**
   * Transform data to principal component space
   * @param X Input data matrix
   * @returns Transformed data in PC space
   */
  transform(X: Matrix): Matrix {
    if (!this.components || !this.mean) {
      throw new Error('PCA must be fitted before transform');
    }

    if (X.cols !== this.mean.cols) {
      throw new Error(
        `Input data has ${X.cols} features, expected ${this.mean.cols}`,
      );
    }

    // Center the data
    const XCentered = this._centerData(X, this.mean);

    // Project onto principal components
    return XCentered.multiply(this.components.transpose());
  }

  /**
   * Fit PCA and transform data in one step
   * @param X Input data matrix
   * @param nComponents Number of principal components
   * @returns Transformed data in PC space
   */
  fitTransform(X: Matrix, nComponents?: number): Matrix {
    this.fit(X, nComponents);
    return this.transform(X);
  }

  /**
   * Get the principal components (eigenvectors)
   */
  getComponents(): Matrix {
    if (!this.components) {
      throw new Error('PCA must be fitted first');
    }
    return this.components.clone();
  }

  /**
   * Get explained variance for each component
   */
  getExplainedVariance(): number[] {
    return [...this.explainedVariance];
  }

  /**
   * Get explained variance ratio for each component
   */
  getExplainedVarianceRatio(): number[] {
    return [...this.explainedVarianceRatio];
  }

  /**
   * Compute mean of each column
   */
  private _computeMean(X: Matrix): Matrix {
    const means: number[] = [];
    for (let j = 0; j < X.cols; j++) {
      let sum = 0;
      for (let i = 0; i < X.rows; i++) {
        sum += X.get(i, j);
      }
      means.push(sum / X.rows);
    }
    return new Matrix([means]);
  }

  /**
   * Center data by subtracting mean
   */
  private _centerData(X: Matrix, mean: Matrix): Matrix {
    const result = X.clone();
    for (let i = 0; i < X.rows; i++) {
      for (let j = 0; j < X.cols; j++) {
        result.set(i, j, X.get(i, j) - mean.get(0, j));
      }
    }
    return result;
  }

  /**
   * Compute covariance matrix
   */
  private _computeCovariance(X: Matrix): Matrix {
    // Covariance = (X^T * X) / (n-1)
    const XT = X.transpose();
    const covariance = XT.multiply(X);
    return covariance.divideScalar(X.rows - 1);
  }

  /**
   * Compute eigenvalues and eigenvectors using power iteration and deflation
   * For simplicity, we'll use a basic approach - in practice, you'd want more robust methods
   */
  private _computeEigenDecomposition(covariance: Matrix): {
    eigenvalues: number[];
    eigenvectors: Matrix;
  } {
    const n = covariance.rows;
    const eigenvalues: number[] = [];
    const eigenvectors: number[][] = [];

    let A = covariance.clone();

    for (let i = 0; i < n; i++) {
      // Power iteration to find dominant eigenvalue/eigenvector
      const result = A.powerIteration();
      eigenvalues.push(result.eigenvalue);

      // Store eigenvector
      const eigenvector: number[] = [];
      for (let j = 0; j < n; j++) {
        eigenvector.push(result.eigenvector.get(j, 0));
      }
      eigenvectors.push(eigenvector);

      // Deflate the matrix (remove this component)
      // A = A - λ * v * v^T
      if (i < n - 1) {
        const v = result.eigenvector;
        const outerProduct = v.multiply(v.transpose());
        const lambdaVVT = outerProduct.multiplyScalar(result.eigenvalue);
        A = A.subtract(lambdaVVT);
      }
    }

    return {
      eigenvalues,
      eigenvectors: new Matrix(eigenvectors),
    };
  }

  /**
   * Sort eigenvectors according to eigenvalue order
   */
  private _sortEigenvectors(
    eigenvectors: Matrix,
    sortedIndices: number[],
  ): Matrix {
    const sortedEigenvectors: number[][] = [];
    for (const idx of sortedIndices) {
      const eigenvector: number[] = [];
      for (let i = 0; i < eigenvectors.rows; i++) {
        eigenvector.push(eigenvectors.get(i, idx));
      }
      sortedEigenvectors.push(eigenvector);
    }
    return new Matrix(sortedEigenvectors);
  }
}
