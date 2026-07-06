/**
 * src/neural/Network.js
 * A High-Performance, Deep Feedforward Neural Network.
 * Supports dynamic N-layer topologies.
 */
import { Matrix } from './Matrix.js';

export class Network {
  /**
   * @param {Array} topology - Array defining the network shape (e.g., [5, 16, 16, 2])
   * Means: 5 Inputs, two Hidden Layers of 16, and 2 Outputs.
   */
  constructor(topology) {
    this.topology = [...topology]; // Store a copy of the architecture
    this.layerCount = topology.length - 1;

    // Dynamically build matrices based on the topology array
    for (let i = 0; i < this.layerCount; i++) {
      let cols = topology[i];     // Inputs to this layer
      let rows = topology[i + 1]; // Outputs from this layer

      // We assign these as top-level properties (e.g., this.weight_0, this.bias_1).
      // This is CRITICAL because it allows our high-speed Genetics.js to 
      // blindly find and mutate them using its `for (const key in network)` loop.
      this[`weight_${i}`] = new Matrix(rows, cols).randomize(-1, 1);
      this[`bias_${i}`] = new Matrix(rows, 1).randomize(-1, 1);
    }
  }

  /**
   * The core Feedforward loop.
   * Dynamically flows through N-layers.
   */
  feedForward(inputArray, activationFunc = Math.tanh) {
    if (inputArray.length !== this.topology[0]) {
      throw new Error(`Feedforward Error: Expected ${this.topology[0]} inputs, got ${inputArray.length}.`);
    }

    let current = Matrix.fromArray(inputArray);

    for (let i = 0; i < this.layerCount; i++) {
      // W * I
      current = Matrix.multiply(this[`weight_${i}`], current);
      // + B
      current.add(this[`bias_${i}`]);
      // Activation Function (Default: Tanh maps to -1 -> 1)
      current.map(activationFunc); 
    }

    return current.toArray();
  }

  /**
   * Deep clone the entire network dynamically.
   * Perfect for genetic algorithms where children inherit parent brains.
   */
  copy() {
    let clone = new Network(this.topology);
    
    for (let i = 0; i < this.layerCount; i++) {
      // Fast Float32Array memory transfer
      clone[`weight_${i}`].data = new Float32Array(this[`weight_${i}`].data);
      clone[`bias_${i}`].data = new Float32Array(this[`bias_${i}`].data);
    }
    
    return clone;
  }
}