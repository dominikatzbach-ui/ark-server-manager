// Coin pickup system — enemies drop coins on death, player collects them.
class CoinManager {
  constructor() {
    this.coins = [];
    this.total = 0; // accumulated coins (persists between waves)
  }

  /** Spawn `amount` coins at world position (x, y) with slight random spread. */
  spawn(x, y, amount) {
    for (let i = 0; i < amount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 30 + Math.random() * 60;
      this.coins.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,  // slight upward bias on burst
        r: 5,
        lifetime: CONFIG.COIN.LIFETIME_MS / 1000,
        w: 10,  // used by aabbCenter (full diameter)
        h: 10,
      });
    }
  }

  /**
   * @param {number} dt  seconds
   * @param {{ x, y, w, h }} player  center-based player bounds
   * @returns {number}  coins collected this frame
   */
  update(dt, player) {
    let collected = 0;
    const GRAVITY    = 80;    // px/s² gentle fall
    const MAGNET_R   = CONFIG.COIN.MAGNET_RANGE;
    const MAGNET_SPD = CONFIG.COIN.MAGNET_SPEED;
    const PICK_R     = 20;    // pickup radius (center-to-center)

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];

      c.lifetime -= dt;
      if (c.lifetime <= 0) {
        this.coins.splice(i, 1);
        continue;
      }

      const dx = player.x - c.x;
      const dy = player.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < MAGNET_R) {
        // Magnet: accelerate toward player proportional to proximity
        const pull = MAGNET_SPD * (1 - dist / MAGNET_R) + MAGNET_SPD * 0.3;
        c.vx += (dx / dist) * pull * dt;
        c.vy += (dy / dist) * pull * dt;
      } else {
        // Normal drift: gravity + gentle drag
        c.vy += GRAVITY * dt;
        c.vx *= Math.pow(0.90, dt * 60);  // drag
        c.vy *= Math.pow(0.98, dt * 60);
      }

      c.x += c.vx * dt;
      c.y += c.vy * dt;

      // Pickup
      if (dist < PICK_R) {
        this.total += 1;
        collected += 1;
        this.coins.splice(i, 1);
      }
    }

    return collected;
  }

  draw(ctx) {
    const now = performance.now();
    for (const c of this.coins) {
      // Fade out when < 2 seconds remain
      const alpha = c.lifetime < 2 ? c.lifetime / 2 : 1;

      // Shine shimmer
      const shimmer = 0.6 + 0.4 * Math.sin(now / 150 + c.x * 0.05);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer coin
      ctx.beginPath();
      ctx.arc(Math.round(c.x), Math.round(c.y), c.r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.COLORS.COIN;
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.arc(Math.round(c.x) - 1, Math.round(c.y) - 1, Math.max(1, c.r * 0.4 * shimmer), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 220, ${shimmer * 0.8})`;
      ctx.fill();

      ctx.restore();
    }
  }

  spend(amount) {
    if (this.total < amount) return false;
    this.total -= amount;
    return true;
  }

  reset() {
    this.coins = [];
    // Note: this.total intentionally NOT reset — carries forward to shop
  }
}
