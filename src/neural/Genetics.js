/**
 * src/neural/Genetics.js
 * High-performance genetic mutation using dynamic property scanning and inline loops.
 */

export function mutateNetwork(network, mutationRate = 0.1, mutationAmount = 0.5) {
  // Dynamically iterate over the network's properties.
  // This automatically handles Deep Networks with any number of layers or biases!
  for (const key in network) {
    if (network[key] && network[key].data instanceof Float32Array) {
      _mutateMatrix(network[key], mutationRate, mutationAmount);
    }
  }
}

/**
 * Internal helper to mutate a Float32Array Matrix instantly without callback overhead.
 */
function _mutateMatrix(matrix, rate, amount) {
  const data = matrix.data;
  const len = data.length;

  for (let i = 0; i < len; i++) {
    // Only process if the mutation triggers
    if (Math.random() < rate) {
      
      // 10% chance: Gene Reset (Complete replacement to maintain genetic diversity)
      // Helps the population escape "local minima" (getting stuck doing the same bad behavior)
      if (Math.random() < 0.1) {
        data[i] = Math.random() * 2 - 1; // Standard -1 to 1 range
      } 
      // 90% chance: Gene Tweak (Nudge the existing weight)
      else {
        // Gaussian-like nudge: Add random value bounded by the mutationAmount
        data[i] += (Math.random() * 2 - 1) * amount;
      }

      // Gene Clamping: Prevent exploding weights (NaN cascade protection)
      // Keeps weights bounded between -10 and 10.
      if (data[i] > 10) data[i] = 10;
      else if (data[i] < -10) data[i] = -10;
    }
  }
}