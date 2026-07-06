import { Vector2D } from '../utils/Vector2D.js';

export class Hazard {
  /**
   * @param {number} x - Starting X coordinate
   * @param {number} y - Starting Y coordinate
   * @param {Object} [options] - Configuration overrides for dynamic hazards
   */
  constructor(x, y, options = {}) {
    this.position = new Vector2D(x, y);
    
    // Optional movement vector (defaults to static)
    this.velocity = options.velocity || new Vector2D(0, 0);
    this.isMoving = this.velocity.x !== 0 || this.velocity.y !== 0;

    // Flexible Danger Defaults
    this.radius = options.radius ?? 6;
    this.damage = options.damage ?? 200;
    this.isInstaKill = options.isInstaKill ?? false; // Bypass health completely

    // Visual effect timer offset (so multiple hazards don't pulse perfectly in sync)
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  /**
   * Called every frame. Handles movement and screen boundary bouncing.
   * @param {number} width - Simulation canvas width
   * @param {number} height - Simulation canvas height
   */
  update(width, height) {
    if (!this.isMoving) return;

    // Apply velocity to position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Basic boundary bouncing (keeps moving hazards inside the arena)
    if (this.position.x - this.radius < 0 || this.position.x + this.radius > width) {
      this.velocity.x *= -1;
    }
    if (this.position.y - this.radius < 0 || this.position.y + this.radius > height) {
      this.velocity.y *= -1;
    }
  }

  /**
   * Helper to check high-speed collision with an Agent.
   * @param {Object} agent - The agent that might be touching the hazard
   * @returns {boolean}
   */
  isHitBy(agent) {
    // High-performance squared distance check (Avoids Math.sqrt)
    const dx = this.position.x - agent.position.x;
    const dy = this.position.y - agent.position.y;
    const distSq = dx * dx + dy * dy;
    
    const combinedRadii = this.radius + agent.radius;
    return distSq < (combinedRadii * combinedRadii);
  }

  /**
   * Calculates the penalty to apply to an agent.
   * @param {Object} agent - The agent taking damage
   * @returns {number} The amount of health to deduct
   */
  inflictDamage(agent) {
    if (this.isInstaKill) {
      return agent.health; // Return agent's total remaining health to kill instantly
    }
    return this.damage;
  }

  /**
   * Renders the hazard to the HTML5 Canvas with a dangerous visual style.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} time - Global simulation time/tick (used for animation)
   */
  draw(ctx, time = 0) {
    // Create a subtle "pulsing" effect to visually communicate danger
    const pulse = Math.sin(time * 0.1 + this.pulsePhase) * 1.5;
    const visualRadius = Math.max(1, this.radius + pulse);

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, visualRadius, 0, Math.PI * 2);
    
    // Instakill hazards are pure dark red, standard hazards are bright orange/red
    ctx.fillStyle = this.isInstaKill ? '#8B0000' : '#FF4500';
    ctx.fill();
    
    // Add a stroke to make it pop against the background
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    ctx.closePath();
  }
}