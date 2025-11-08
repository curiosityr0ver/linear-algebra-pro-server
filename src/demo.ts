import { Matrix } from './lib';

console.log('=== Linear Algebra Matrix Operations Demo ===\n');

// Create some sample matrices
console.log('1. Creating matrices:');
const A = new Matrix([
  [1, 2, 3],
  [4, 5, 6],
]);
const C = new Matrix([
  [1, 2],
  [3, 4],
]);
const D = new Matrix([
  [5, 6],
  [7, 8],
]);

console.log('Matrix A (2x3):');
console.log(A.toString());
console.log('Matrix C (2x2):');
console.log(C.toString());
console.log('Matrix D (2x2):');
console.log(D.toString());

// Matrix addition
console.log('\n2. Matrix Addition (C + D):');
const sum = C.add(D);
console.log(sum.toString());

// Matrix multiplication
console.log('\n3. Matrix Multiplication (C * D):');
const product = C.multiply(D);
console.log(product.toString());

// Scalar operations
console.log('\n4. Scalar Operations (C * 3):');
const scaled = C.multiplyScalar(3);
console.log(scaled.toString());

// Transpose
console.log('\n5. Matrix Transpose (A^T):');
const transposeA = A.transpose();
console.log(transposeA.toString());

// Trace
console.log('\n6. Matrix Trace (sum of diagonal elements):');
const trace = C.trace();
console.log(`Trace of C: ${trace}`);

// Determinant
console.log('\n7. Matrix Determinant:');
const det = C.determinant();
console.log(`Determinant of C: ${det}`);

// Eigenvalue calculation
console.log('\n8. Dominant Eigenvalue (Power Iteration):');
const eigenResult = C.powerIteration();
console.log(`Dominant eigenvalue: ${eigenResult.eigenvalue.toFixed(4)}`);
console.log('Corresponding eigenvector:');
console.log(eigenResult.eigenvector.toString());

// Static methods
console.log('\n9. Static Matrix Creation:');
const identity = Matrix.identity(3);
console.log('3x3 Identity matrix:');
console.log(identity.toString());

const zeros = Matrix.zeros(2, 3);
console.log('2x3 Zero matrix:');
console.log(zeros.toString());

const ones = Matrix.ones(2, 2);
console.log('2x2 Ones matrix:');
console.log(ones.toString());

console.log('\n=== Demo Complete ===');
