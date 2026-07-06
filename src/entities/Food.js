import { Vector2D } from '../utils/Vector2D.js';

export class Food {
  /**
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   * @param {Object} [options] - Configuration overrides
   */
  constructor(x, y, options = {}) {
    this.position = new Vector2D(x, y);
    
    // 1. Flexible Defaults
    this.radius = options.radius ?? 4;
    this.energyValue = options.energyValue ?? 100;
    this.maxEnergy = this.energyValue; // Store baseline for visual scaling
    
    // 2. Simulation Dynamics
    this.decays = options.decays ?? false;
    this.isDead = false; // Flag for the engine's garbage collector
  }

  /**
   * Called every frame by the simulation engine.
   * @param {number} decayRate - How much energy is lost per tick
   */
  update(decayRate = 0.05) {
    if (this.decays && !this.isDead) {
      this.energyValue -= decayRate;
      
      // Physically shrink the food as it loses nutritional value
      this.radius = Math.max(0.5, (this.energyValue / this.maxEnergy) * 4);
      
      // Mark for removal if it rots completely away
      if (this.energyValue <= 0) {
         this.isDead = true; 
      }
    }
  }

  /**
   * Helper to check collision with an Agent.
   * @param {Object} agent - The agent trying to eat
   * @returns {boolean}
   */
  isConsumedBy(agent) {
    // Simple circle-collision using squared distances (faster than Math.sqrt)
    const dx = this.position.x - agent.position.x;
    const dy = this.position.y - agent.position.y;
    const distSq = dx * dx + dy * dy;
    
    const combinedRadii = this.radius + agent.radius;
    return distSq < (combinedRadii * combinedRadii);
  }

  /**
   * Renders the food to an HTML5 Canvas.
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (this.isDead) return;
    
    // Opacity drops as the food rots
    const intensity = Math.max(0, this.energyValue / this.maxEnergy);
    
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 255, 100, ${intensity})`; // Vibrant green fading out
    ctx.fill();
    ctx.closePath();
  }
}