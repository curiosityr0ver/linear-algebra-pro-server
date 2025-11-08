export class Matrix {
  private _data: number[][];
  private _rows: number;
  private _cols: number;

  /**
   * Creates a new Matrix from a 2D array
   * @param data 2D array of numbers
   */
  constructor(data: number[][]) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Matrix data must be a non-empty 2D array');
    }

    const cols = data[0].length;
    if (cols === 0) {
      throw new Error('Matrix must have at least one column');
    }

    // Validate all rows have the same number of columns
    for (let i = 1; i < data.length; i++) {
      if (data[i].length !== cols) {
        throw new Error(
          `Row ${i} has ${data[i].length} columns, expected ${cols}`,
        );
      }
    }

    // Validate all elements are numbers
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        if (typeof data[i][j] !== 'number' || isNaN(data[i][j])) {
          throw new Error(`Element at [${i}][${j}] must be a valid number`);
        }
      }
    }

    this._data = data.map((row) => [...row]); // Deep copy
    this._rows = data.length;
    this._cols = cols;
  }

  /**
   * Creates an identity matrix of given size
   * @param size Size of the identity matrix
   * @returns Identity matrix
   */
  static identity(size: number): Matrix {
    if (size <= 0 || !Number.isInteger(size)) {
      throw new Error('Size must be a positive integer');
    }

    const data: number[][] = [];
    for (let i = 0; i < size; i++) {
      const row: number[] = [];
      for (let j = 0; j < size; j++) {
        row.push(i === j ? 1 : 0);
      }
      data.push(row);
    }
    return new Matrix(data);
  }

  /**
   * Creates a zero matrix of given dimensions
   * @param rows Number of rows
   * @param cols Number of columns
   * @returns Zero matrix
   */
  static zeros(rows: number, cols: number): Matrix {
    if (
      rows <= 0 ||
      cols <= 0 ||
      !Number.isInteger(rows) ||
      !Number.isInteger(cols)
    ) {
      throw new Error('Rows and columns must be positive integers');
    }

    const data: number[][] = [];
    for (let i = 0; i < rows; i++) {
      data.push(new Array<number>(cols).fill(0));
    }
    return new Matrix(data);
  }

  /**
   * Creates a matrix filled with ones
   * @param rows Number of rows
   * @param cols Number of columns
   * @returns Ones matrix
   */
  static ones(rows: number, cols: number): Matrix {
    if (
      rows <= 0 ||
      cols <= 0 ||
      !Number.isInteger(rows) ||
      !Number.isInteger(cols)
    ) {
      throw new Error('Rows and columns must be positive integers');
    }

    const data: number[][] = [];
    for (let i = 0; i < rows; i++) {
      data.push(new Array<number>(cols).fill(1));
    }
    return new Matrix(data);
  }

  /**
   * Gets the number of rows
   */
  get rows(): number {
    return this._rows;
  }

  /**
   * Gets the number of columns
   */
  get cols(): number {
    return this._cols;
  }

  /**
   * Gets the shape as [rows, cols]
   */
  get shape(): [number, number] {
    return [this._rows, this._cols];
  }

  /**
   * Gets a copy of the matrix data
   */
  get data(): number[][] {
    return this._data.map((row) => [...row]);
  }

  /**
   * Checks if matrix is square
   */
  get isSquare(): boolean {
    return this._rows === this._cols;
  }

  /**
   * Gets element at position [i][j]
   * @param i Row index
   * @param j Column index
   */
  get(i: number, j: number): number {
    if (i < 0 || i >= this._rows || j < 0 || j >= this._cols) {
      throw new Error(`Index out of bounds: [${i}][${j}]`);
    }
    return this._data[i][j];
  }

  /**
   * Sets element at position [i][j]
   * @param i Row index
   * @param j Column index
   * @param value Value to set
   */
  set(i: number, j: number, value: number): void {
    if (i < 0 || i >= this._rows || j < 0 || j >= this._cols) {
      throw new Error(`Index out of bounds: [${i}][${j}]`);
    }
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number');
    }
    this._data[i][j] = value;
  }

  /**
   * Creates a deep copy of the matrix
   */
  clone(): Matrix {
    return new Matrix(this._data);
  }

  /**
   * Checks if two matrices are equal (within epsilon tolerance)
   * @param other Matrix to compare with
   * @param epsilon Tolerance for floating point comparison
   */
  equals(other: Matrix, epsilon: number = 1e-10): boolean {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      return false;
    }

    for (let i = 0; i < this._rows; i++) {
      for (let j = 0; j < this._cols; j++) {
        if (Math.abs(this._data[i][j] - other._data[i][j]) > epsilon) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Adds this matrix with another matrix (element-wise)
   * @param other Matrix to add
   * @returns New matrix containing the sum
   */
  add(other: Matrix): Matrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error(
        `Cannot add matrices: shapes [${this._rows}, ${this._cols}] and [${other._rows}, ${other._cols}] are incompatible`,
      );
    }

    const result: number[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this._cols; j++) {
        row.push(this._data[i][j] + other._data[i][j]);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Subtracts another matrix from this matrix (element-wise)
   * @param other Matrix to subtract
   * @returns New matrix containing the difference
   */
  subtract(other: Matrix): Matrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error(
        `Cannot subtract matrices: shapes [${this._rows}, ${this._cols}] and [${other._rows}, ${other._cols}] are incompatible`,
      );
    }

    const result: number[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this._cols; j++) {
        row.push(this._data[i][j] - other._data[i][j]);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Multiplies this matrix by a scalar
   * @param scalar Scalar value to multiply by
   * @returns New matrix containing the scaled result
   */
  multiplyScalar(scalar: number): Matrix {
    if (typeof scalar !== 'number' || isNaN(scalar)) {
      throw new Error('Scalar must be a valid number');
    }

    const result: number[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this._cols; j++) {
        row.push(this._data[i][j] * scalar);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Divides this matrix by a scalar
   * @param scalar Scalar value to divide by
   * @returns New matrix containing the divided result
   */
  divideScalar(scalar: number): Matrix {
    if (typeof scalar !== 'number' || isNaN(scalar)) {
      throw new Error('Scalar must be a valid number');
    }
    if (scalar === 0) {
      throw new Error('Cannot divide by zero');
    }

    const result: number[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < this._cols; j++) {
        row.push(this._data[i][j] / scalar);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Multiplies this matrix with another matrix (matrix multiplication)
   * @param other Matrix to multiply with
   * @returns New matrix containing the product
   */
  multiply(other: Matrix): Matrix {
    if (this._cols !== other._rows) {
      throw new Error(
        `Cannot multiply matrices: first matrix has ${this._cols} columns, second matrix has ${other._rows} rows`,
      );
    }

    const result: number[][] = [];
    for (let i = 0; i < this._rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < other._cols; j++) {
        let sum = 0;
        for (let k = 0; k < this._cols; k++) {
          sum += this._data[i][k] * other._data[k][j];
        }
        row.push(sum);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Transposes this matrix
   * @returns New matrix containing the transpose
   */
  transpose(): Matrix {
    const result: number[][] = [];
    for (let j = 0; j < this._cols; j++) {
      const row: number[] = [];
      for (let i = 0; i < this._rows; i++) {
        row.push(this._data[i][j]);
      }
      result.push(row);
    }
    return new Matrix(result);
  }

  /**
   * Calculates the trace of this matrix (sum of diagonal elements)
   * Only defined for square matrices
   * @returns The trace value
   */
  trace(): number {
    if (!this.isSquare) {
      throw new Error(
        `Trace is only defined for square matrices. Matrix shape: [${this._rows}, ${this._cols}]`,
      );
    }

    let sum = 0;
    for (let i = 0; i < this._rows; i++) {
      sum += this._data[i][i];
    }
    return sum;
  }

  /**
   * Calculates the determinant of this matrix
   * Only defined for square matrices
   * @returns The determinant value
   */
  determinant(): number {
    if (!this.isSquare) {
      throw new Error(
        `Determinant is only defined for square matrices. Matrix shape: [${this._rows}, ${this._cols}]`,
      );
    }

    return this._calculateDeterminant(this._data);
  }

  /**
   * Helper method to calculate determinant using cofactor expansion
   * @param data Matrix data as 2D array
   * @returns Determinant value
   */
  private _calculateDeterminant(data: number[][]): number {
    const n = data.length;

    // Base case: 1x1 matrix
    if (n === 1) {
      return data[0][0];
    }

    // Base case: 2x2 matrix
    if (n === 2) {
      return data[0][0] * data[1][1] - data[0][1] * data[1][0];
    }

    // Recursive case: cofactor expansion along first row
    let det = 0;
    for (let j = 0; j < n; j++) {
      const cofactor = this._getCofactor(data, 0, j);
      const sign = j % 2 === 0 ? 1 : -1;
      det += sign * data[0][j] * this._calculateDeterminant(cofactor);
    }

    return det;
  }

  /**
   * Gets the cofactor matrix by removing specified row and column
   * @param data Original matrix data
   * @param rowToRemove Row to remove
   * @param colToRemove Column to remove
   * @returns Cofactor matrix data
   */
  private _getCofactor(
    data: number[][],
    rowToRemove: number,
    colToRemove: number,
  ): number[][] {
    const n = data.length;
    const cofactor: number[][] = [];

    for (let i = 0; i < n; i++) {
      if (i === rowToRemove) continue;
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        if (j !== colToRemove) {
          row.push(data[i][j]);
        }
      }
      cofactor.push(row);
    }

    return cofactor;
  }

  /**
   * Calculates the dominant eigenvalue and eigenvector using power iteration
   * Only defined for square matrices
   * @param maxIterations Maximum number of iterations (default: 1000)
   * @param tolerance Convergence tolerance (default: 1e-10)
   * @returns Object containing eigenvalue and eigenvector
   */
  powerIteration(
    maxIterations: number = 1000,
    tolerance: number = 1e-10,
  ): { eigenvalue: number; eigenvector: Matrix } {
    if (!this.isSquare) {
      throw new Error(
        `Power iteration is only defined for square matrices. Matrix shape: [${this._rows}, ${this._cols}]`,
      );
    }

    // Initialize random eigenvector
    let v = Matrix.zeros(this._rows, 1);
    for (let i = 0; i < this._rows; i++) {
      v.set(i, 0, Math.random());
    }

    // Normalize initial vector
    v = this._normalizeVector(v);

    let eigenvalue = 0;
    let prevEigenvalue = 0;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Multiply matrix by current vector
      const vNew = this.multiply(v);

      // Calculate Rayleigh quotient for eigenvalue estimate
      eigenvalue = 0;
      let normSquared = 0;
      for (let i = 0; i < this._rows; i++) {
        eigenvalue += vNew.get(i, 0) * v.get(i, 0);
        normSquared += vNew.get(i, 0) * vNew.get(i, 0);
      }

      // Normalize the new vector
      const norm = Math.sqrt(normSquared);
      for (let i = 0; i < this._rows; i++) {
        v.set(i, 0, vNew.get(i, 0) / norm);
      }

      // Check convergence
      if (Math.abs(eigenvalue - prevEigenvalue) < tolerance) {
        break;
      }

      prevEigenvalue = eigenvalue;
    }

    return { eigenvalue, eigenvector: v };
  }

  /**
   * Normalizes a column vector to unit length
   * @param vector Column vector to normalize
   * @returns Normalized vector
   */
  private _normalizeVector(vector: Matrix): Matrix {
    if (vector.cols !== 1) {
      throw new Error('Vector must be a column vector (n x 1)');
    }

    let norm = 0;
    for (let i = 0; i < vector.rows; i++) {
      norm += vector.get(i, 0) * vector.get(i, 0);
    }
    norm = Math.sqrt(norm);

    if (norm === 0) {
      throw new Error('Cannot normalize zero vector');
    }

    const normalized = Matrix.zeros(vector.rows, 1);
    for (let i = 0; i < vector.rows; i++) {
      normalized.set(i, 0, vector.get(i, 0) / norm);
    }

    return normalized;
  }

  /**
   * String representation of the matrix
   */
  toString(): string {
    return this._data.map((row) => row.join('\t')).join('\n');
  }
}
