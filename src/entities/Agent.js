import { Vector2D } from '../utils/Vector2D.js';
import { Network } from '../neural/Network.js';

export class Agent {
  /**
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {Network} [brain] - Optional pre-trained brain (inherited during reproduction)
   */
  constructor(x, y, brain = null) {
    // Physics & Movement
    this.position = new Vector2D(x, y);
    // Start with a random normalized velocity so they don't all face top-left
    this.velocity = new Vector2D(Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().mult(2);
    this.acceleration = new Vector2D(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.5;
    this.radius = 5;

    // Biological Metrics (Crucial for the Fitness Function)
    this.maxHealth = 200;
    this.health = this.maxHealth;
    this.score = 0;      // Primary fitness metric: Food eaten
    this.timeAlive = 0;  // Secondary fitness metric: Survival duration
    this.dead = false;

    // Brain Integration
    // Inputs: 4 (Relative Food dX, Food dY, Hazard dX, Hazard dY)
    // Hidden: 8 (Slightly larger hidden layer for complex steering)
    // Outputs: 2 (Desired Velocity X, Desired Velocity Y)
    // Notice we use the new Array topology syntax!
    this.brain = brain ? brain : new Network([4, 8, 2]); 
  }

  /**
   * Core decision-making loop. Maps environment data to network inputs.
   * @param {Object} closestFood 
   * @param {Object} closestHazard 
   * @param {number} width - Simulation canvas width (used to normalize inputs)
   * @param {number} height - Simulation canvas height
   */
  think(closestFood, closestHazard, width, height) {
    if (this.dead) return;

    // Initialize blank sensory array
    let inputs = [0, 0, 0, 0];

    // AI loves normalized data (values between -1 and 1).
    // By calculating the delta X and delta Y and dividing by the screen size,
    // we give the AI both DIRECTION (positive/negative) and DISTANCE (magnitude).
    if (closestFood) {
      inputs[0] = (closestFood.position.x - this.position.x) / width;
      inputs[1] = (closestFood.position.y - this.position.y) / height;
    }

    if (closestHazard) {
      inputs[2] = (closestHazard.position.x - this.position.x) / width;
      inputs[3] = (closestHazard.position.y - this.position.y) / height;
    }

    // Pass inputs through the high-performance Neural Network Matrix
    let output = this.brain.feedForward(inputs);

    // Because the Network now uses Math.tanh, outputs are ALREADY perfectly between -1 and 1!
    // No messy mapping required. We map these directly to a desired velocity vector.
    let desiredVelocity = new Vector2D(output[0], output[1]);
    
    // If the network outputs [0,0], it stops. Otherwise, scale to max speed.
    if (desiredVelocity.magSq() > 0) {
      desiredVelocity.normalize().mult(this.maxSpeed);
    }
    
    // Reynolds Steering Formula: Steering = Desired - Current
    let steerForce = desiredVelocity.sub(this.velocity).limit(this.maxForce);
    this.applyForce(steerForce);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  /**
   * Standard physics update + biological tracking
   * @param {number} width - Used for boundary bouncing
   * @param {number} height - Used for boundary bouncing
   */
  update(width, height) {
    if (this.dead) return;

    // Physics Integration (Euler)
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0); // Reset acceleration each frame

    // Boundary Bouncing (Keep agents in the arena)
    if (this.position.x < this.radius || this.position.x > width - this.radius) {
      this.velocity.x *= -1;
      this.position.x = Math.max(this.radius, Math.min(this.position.x, width - this.radius));
    }
    if (this.position.y < this.radius || this.position.y > height - this.radius) {
      this.velocity.y *= -1;
      this.position.y = Math.max(this.radius, Math.min(this.position.y, height - this.radius));
    }

    // Biological Decay
    this.timeAlive++;
    this.health -= 0.5; // Burn energy constantly
    if (this.health <= 0) {
      this.dead = true;
    }
  }

  /**
   * Helper to process eating food
   * @param {Object} food 
   */
  eat(food) {
    this.score += 1;
    this.health += food.energyValue;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth; // Cap health so they can't live forever off one meal
    }
  }

  /**
   * Creates an exact clone of this agent (used by the Genetic Algorithm)
   */
  clone() {
    // We utilize the Network.copy() method we built earlier!
    let brainClone = this.brain.copy();
    return new Agent(this.position.x, this.position.y, brainClone);
  }
}