import { Matrix } from './matrix';

describe('Matrix', () => {
  describe('constructor', () => {
    it('should create a matrix from valid 2D array', () => {
      const data = [
        [1, 2],
        [3, 4],
      ];
      const matrix = new Matrix(data);
      expect(matrix.rows).toBe(2);
      expect(matrix.cols).toBe(2);
      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(0, 1)).toBe(2);
      expect(matrix.get(1, 0)).toBe(3);
      expect(matrix.get(1, 1)).toBe(4);
    });

    it('should throw error for empty array', () => {
      expect(() => new Matrix([])).toThrow(
        'Matrix data must be a non-empty 2D array',
      );
    });

    it('should throw error for invalid data types', () => {
      expect(() => new Matrix([[1, NaN]])).toThrow(
        'Element at [0][1] must be a valid number',
      );
      expect(() => new Matrix([[1, NaN]])).toThrow(
        'Element at [0][1] must be a valid number',
      );
    });

    it('should throw error for inconsistent row lengths', () => {
      const data = [[1, 2], [3]];
      expect(() => new Matrix(data)).toThrow('Row 1 has 1 columns, expected 2');
    });
  });

  describe('static methods', () => {
    describe('identity', () => {
      it('should create identity matrix', () => {
        const identity = Matrix.identity(3);
        expect(identity.rows).toBe(3);
        expect(identity.cols).toBe(3);
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            expect(identity.get(i, j)).toBe(i === j ? 1 : 0);
          }
        }
      });

      it('should throw error for invalid size', () => {
        expect(() => Matrix.identity(0)).toThrow(
          'Size must be a positive integer',
        );
        expect(() => Matrix.identity(-1)).toThrow(
          'Size must be a positive integer',
        );
        expect(() => Matrix.identity(1.5)).toThrow(
          'Size must be a positive integer',
        );
      });
    });

    describe('zeros', () => {
      it('should create zero matrix', () => {
        const zeros = Matrix.zeros(2, 3);
        expect(zeros.rows).toBe(2);
        expect(zeros.cols).toBe(3);
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            expect(zeros.get(i, j)).toBe(0);
          }
        }
      });

      it('should throw error for invalid dimensions', () => {
        expect(() => Matrix.zeros(0, 3)).toThrow(
          'Rows and columns must be positive integers',
        );
        expect(() => Matrix.zeros(-1, 3)).toThrow(
          'Rows and columns must be positive integers',
        );
        expect(() => Matrix.zeros(2.5, 3)).toThrow(
          'Rows and columns must be positive integers',
        );
      });
    });

    describe('ones', () => {
      it('should create ones matrix', () => {
        const ones = Matrix.ones(2, 3);
        expect(ones.rows).toBe(2);
        expect(ones.cols).toBe(3);
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 3; j++) {
            expect(ones.get(i, j)).toBe(1);
          }
        }
      });

      it('should throw error for invalid dimensions', () => {
        expect(() => Matrix.ones(0, 3)).toThrow(
          'Rows and columns must be positive integers',
        );
        expect(() => Matrix.ones(2, 0)).toThrow(
          'Rows and columns must be positive integers',
        );
        expect(() => Matrix.ones(2.5, 3)).toThrow(
          'Rows and columns must be positive integers',
        );
      });
    });
  });

  describe('properties', () => {
    it('should return correct shape', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(matrix.shape).toEqual([2, 3]);
    });

    it('should identify square matrices', () => {
      const square = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const nonSquare = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(square.isSquare).toBe(true);
      expect(nonSquare.isSquare).toBe(false);
    });
  });

  describe('get and set', () => {
    it('should get and set elements correctly', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      expect(matrix.get(0, 0)).toBe(1);
      expect(matrix.get(1, 1)).toBe(4);

      matrix.set(0, 0, 5);
      expect(matrix.get(0, 0)).toBe(5);
    });

    it('should throw error for out of bounds access', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      expect(() => matrix.get(2, 0)).toThrow('Index out of bounds');
      expect(() => matrix.set(-1, 0, 5)).toThrow('Index out of bounds');
    });

    it('should throw error for invalid set values', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      expect(() => matrix.set(0, 0, NaN)).toThrow(
        'Value must be a valid number',
      );
    });
  });

  describe('clone and equals', () => {
    it('should create deep copy with clone', () => {
      const original = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const cloned = original.clone();
      expect(cloned.equals(original)).toBe(true);
      expect(cloned).not.toBe(original); // Different object
    });

    it('should compare matrices correctly with equals', () => {
      const m1 = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const m2 = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const m3 = new Matrix([
        [1, 2],
        [3, 5],
      ]);
      const m4 = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);

      expect(m1.equals(m2)).toBe(true);
      expect(m1.equals(m3)).toBe(false);
      expect(m1.equals(m4)).toBe(false);
      expect(m1.equals(m2, 1e-15)).toBe(true); // Custom tolerance
    });
  });

  describe('arithmetic operations', () => {
    describe('add', () => {
      it('should add matrices element-wise', () => {
        const m1 = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const m2 = new Matrix([
          [5, 6],
          [7, 8],
        ]);
        const result = m1.add(m2);
        expect(result.data).toEqual([
          [6, 8],
          [10, 12],
        ]);
      });

      it('should throw error for incompatible shapes', () => {
        const m1 = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const m2 = new Matrix([[1, 2, 3]]);
        expect(() => m1.add(m2)).toThrow('Cannot add matrices');
      });
    });

    describe('subtract', () => {
      it('should subtract matrices element-wise', () => {
        const m1 = new Matrix([
          [5, 6],
          [7, 8],
        ]);
        const m2 = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const result = m1.subtract(m2);
        expect(result.data).toEqual([
          [4, 4],
          [4, 4],
        ]);
      });
    });

    describe('multiplyScalar', () => {
      it('should multiply matrix by scalar', () => {
        const matrix = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const result = matrix.multiplyScalar(3);
        expect(result.data).toEqual([
          [3, 6],
          [9, 12],
        ]);
      });

      it('should throw error for invalid scalar', () => {
        const matrix = new Matrix([[1, 2]]);
        expect(() => matrix.multiplyScalar(NaN)).toThrow(
          'Scalar must be a valid number',
        );
      });
    });

    describe('divideScalar', () => {
      it('should divide matrix by scalar', () => {
        const matrix = new Matrix([
          [6, 8],
          [10, 12],
        ]);
        const result = matrix.divideScalar(2);
        expect(result.data).toEqual([
          [3, 4],
          [5, 6],
        ]);
      });

      it('should throw error for division by zero', () => {
        const matrix = new Matrix([[1, 2]]);
        expect(() => matrix.divideScalar(0)).toThrow('Cannot divide by zero');
      });

      it('should throw error for invalid scalar', () => {
        const matrix = new Matrix([[1, 2]]);
        expect(() => matrix.divideScalar(NaN)).toThrow(
          'Scalar must be a valid number',
        );
      });
    });

    describe('multiply', () => {
      it('should multiply matrices correctly', () => {
        const m1 = new Matrix([
          [1, 2],
          [3, 4],
        ]);
        const m2 = new Matrix([
          [5, 6],
          [7, 8],
        ]);
        const result = m1.multiply(m2);
        expect(result.data).toEqual([
          [19, 22],
          [43, 50],
        ]);
      });

      it('should throw error for incompatible dimensions', () => {
        const m1 = new Matrix([[1, 2, 3]]);
        const m2 = new Matrix([[1], [2]]);
        expect(() => m1.multiply(m2)).toThrow('Cannot multiply matrices');
      });
    });
  });

  describe('transpose', () => {
    it('should transpose matrix correctly', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      const transposed = matrix.transpose();
      expect(transposed.data).toEqual([
        [1, 4],
        [2, 5],
        [3, 6],
      ]);
    });

    it('should transpose square matrix', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const transposed = matrix.transpose();
      expect(transposed.data).toEqual([
        [1, 3],
        [2, 4],
      ]);
    });
  });

  describe('trace', () => {
    it('should calculate trace correctly', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      expect(matrix.trace()).toBe(15); // 1 + 5 + 9
    });

    it('should throw error for non-square matrix', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(() => matrix.trace()).toThrow(
        'Trace is only defined for square matrices',
      );
    });
  });

  describe('determinant', () => {
    it('should calculate determinant for 1x1 matrix', () => {
      const matrix = new Matrix([[5]]);
      expect(matrix.determinant()).toBe(5);
    });

    it('should calculate determinant for 2x2 matrix', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      expect(matrix.determinant()).toBe(-2); // 1*4 - 2*3
    });

    it('should calculate determinant for 3x3 matrix', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      expect(matrix.determinant()).toBe(0); // This matrix is singular
    });

    it('should calculate determinant for identity matrix', () => {
      const identity = Matrix.identity(3);
      expect(identity.determinant()).toBe(1);
    });

    it('should throw error for non-square matrix', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(() => matrix.determinant()).toThrow(
        'Determinant is only defined for square matrices',
      );
    });
  });

  describe('powerIteration', () => {
    it('should find dominant eigenvalue for symmetric matrix', () => {
      // Create a symmetric matrix with known eigenvalues
      const matrix = new Matrix([
        [4, 1],
        [1, 2],
      ]);
      const result = matrix.powerIteration();

      // The dominant eigenvalue should be approximately 4.4142 (sqrt(20) + 1)
      expect(result.eigenvalue).toBeCloseTo(4.4142, 3);
      expect(result.eigenvector.rows).toBe(2);
      expect(result.eigenvector.cols).toBe(1);
    });

    it('should throw error for non-square matrix', () => {
      const matrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      expect(() => matrix.powerIteration()).toThrow(
        'Power iteration is only defined for square matrices',
      );
    });

    it('should converge within specified iterations', () => {
      const matrix = new Matrix([
        [2, 0],
        [0, 1],
      ]);
      const result = matrix.powerIteration(10);
      expect(result.eigenvalue).toBeCloseTo(2, 2); // Should find eigenvalue 2
    });
  });

  describe('toString', () => {
    it('should format matrix as string', () => {
      const matrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      const str = matrix.toString();
      expect(str).toBe('1\t2\n3\t4');
    });
  });
});
