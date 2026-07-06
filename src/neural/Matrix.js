/**
 * A High-Performance Matrix math class for Neural Networks.
 * Optimized using 1D Float32Arrays for contiguous memory and cache locality.
 */
export class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    // Float32Array is significantly faster and more memory-efficient than nested Arrays
    this.data = new Float32Array(rows * cols);
  }

  // Populate matrix with random weights (defaulting to Xavier/Glorot initialization scale)
  randomize(min = -1, max = 1) {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = Math.random() * (max - min) + min;
    }
    return this; // Enable chaining
  }

  // Add a scalar or another matrix (element-wise)
  add(n) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        throw new Error("Matrix Math Error: Dimensions must match for addition.");
      }
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] += n.data[i];
      }
    } else {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] += n;
      }
    }
    return this;
  }

  // Element-wise multiplication (Hadamard product) OR Scalar multiplication
  multiply(n) {
    if (n instanceof Matrix) {
      if (this.rows !== n.rows || this.cols !== n.cols) {
        throw new Error("Matrix Math Error: Dimensions must match for Hadamard product.");
      }
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] *= n.data[i];
      }
    } else {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] *= n;
      }
    }
    return this;
  }

  // Apply a function to every element (Mutates original matrix)
  map(func) {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = func(this.data[i]);
    }
    return this;
  }

  // Static Map: Returns a NEW matrix instead of mutating the original (Crucial for derivatives)
  static map(matrix, func) {
    let result = new Matrix(matrix.rows, matrix.cols);
    for (let i = 0; i < matrix.data.length; i++) {
      result.data[i] = func(matrix.data[i]);
    }
    return result;
  }

  // Matrix Dot Product (Feedforward: Inputs * Weights)
  static multiply(a, b) {
    if (a.cols !== b.rows) {
      throw new Error(`Matrix Math Error: Columns of A (${a.cols}) must match rows of B (${b.rows}).`);
    }
    let result = new Matrix(a.rows, b.cols);
    
    // Optimized loop for 1D array indexing
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < b.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
           sum += a.data[i * a.cols + k] * b.data[k * b.cols + j];
        }
        result.data[i * b.cols + j] = sum;
      }
    }
    return result;
  }

  // Element-wise Subtraction (Crucial for calculating network errors)
  static subtract(a, b) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      throw new Error("Matrix Math Error: Dimensions must match for subtraction.");
    }
    let result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < a.data.length; i++) {
      result.data[i] = a.data[i] - b.data[i];
    }
    return result;
  }

  // Transpose the matrix (Crucial for Backpropagation / calculating gradients)
  static transpose(matrix) {
    let result = new Matrix(matrix.cols, matrix.rows);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[j * matrix.rows + i] = matrix.data[i * matrix.cols + j];
      }
    }
    return result;
  }

  // Convert a flat array into a 1D Column Matrix
  static fromArray(arr) {
    let m = new Matrix(arr.length, 1);
    for (let i = 0; i < arr.length; i++) {
      m.data[i] = arr[i];
    }
    return m;
  }

  // Convert Matrix back to a flat array
  toArray() {
    return Array.from(this.data);
  }
  
  // Debugging helper
  print() {
    let table = [];
    for (let i = 0; i < this.rows; i++) {
      table.push(Array.from(this.data.slice(i * this.cols, (i + 1) * this.cols)));
    }
    console.table(table);
  }
}