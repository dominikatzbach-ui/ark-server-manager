// Power-up drops — occasionally fall from destroyed enemies.
// Two types: 'shield' (temporary invincibility) and 'spread' (3-way shot).
class PowerupManager {
  constructor() {
    this.powerups = [];
  }

  /**
   * 10% chance to drop a random power-up at (x, y).
   * Boss deaths always drop one (forced = true).
   */
  maybeSpawn(x, y, forced = false) {
    if (!forced && Math.random() > 0.10) return;
    const types = ['shield', 'spread'];
    const type  = types[Math.floor(Math.random() * types.length)];
    this.powerups.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 50,
      vy: 55,
      type,
      w: 22,
      h: 22,
      lifetime: 9.0,
    });
  }

  /**
   * @param {number} dt
   * @param {{ x, y, w, h }} player  center-based bounds
   * @returns {string|null}  power-up type collected, or null
   */
  update(dt, player) {
    let collected = null;
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.lifetime -= dt;
      if (p.lifetime <= 0) { this.powerups.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (Utils.aabbCenter(p, player)) {
        collected = p.type;
        this.powerups.splice(i, 1);
      }
    }
    return collected;
  }

  draw(ctx) {
    const now = performance.now();
    for (const p of this.powerups) {
      const alpha  = p.lifetime < 2.5 ? p.lifetime / 2.5 : 1;
      const pulse  = 0.85 + 0.15 * Math.sin(now / 180);
      const r      = 10 * pulse;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'shield') {
        // Blue circle with 'S'
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 180, 255, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Orange circle with 'W' (wide shot)
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 153, 0, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'shield' ? 'S' : 'W', p.x, p.y);

      ctx.restore();
    }
  }

  reset() {
    this.powerups = [];
  }
}
