// Bullet system with object pooling.
//
// A single free-list (`_pool`) is shared by player and enemy bullets so the
// game never allocates a bullet object after warm-up — spawning pops a recycled
// object, and culling an off-screen bullet pushes it back. Positions (x, y) are
// the CENTER of each bullet, which keeps AABB collision (Step 5) symmetric.
class BulletManager {
  constructor() {
    this.playerBullets = [];
    this.enemyBullets  = [];
    this._pool         = []; // recycled bullet objects, ready for reuse
  }

  /** Pull a bullet object off the pool, or allocate one if the pool is empty. */
  _acquire() {
    return this._pool.pop() ||
      { x: 0, y: 0, vx: 0, vy: 0, w: 0, h: 0, damage: 1, from: 'player' };
  }

  /** Return a bullet object to the pool for reuse (e.g. after a collision). */
  recycle(b) {
    this._pool.push(b);
  }

  /** Fire a player bullet upward from (x, y). `vx` lets upgrades angle it. */
  spawnPlayer(x, y, vx = 0, damage = 1) {
    const b = this._acquire();
    b.x = x;  b.y = y;
    b.vx = vx;
    b.vy = -CONFIG.BULLET.PLAYER_SPEED;
    b.w = 4;  b.h = 14;
    b.damage = damage;
    b.from = 'player';
    this.playerBullets.push(b);
    return b;
  }

  /**
   * Fire a 3-way spread from (x, y): center + two angled side shots.
   * @param {number} spreadDeg  half-angle of each side shot in degrees
   * @param {number} damage
   */
  spawnSpread(x, y, spreadDeg = 15, damage = 1) {
    const sp  = CONFIG.BULLET.PLAYER_SPEED;
    const rad = spreadDeg * Math.PI / 180;
    const offsets = [-rad, 0, rad];
    for (const angle of offsets) {
      const b = this._acquire();
      b.x = x;  b.y = y;
      b.vx = Math.sin(angle) * sp;
      b.vy = -Math.cos(angle) * sp;
      b.w = 4;  b.h = 14;
      b.damage = damage;
      b.from = 'player';
      this.playerBullets.push(b);
    }
  }

  /** Fire an enemy bullet from (x, y) aimed at (targetX, targetY). */
  spawnEnemy(x, y, targetX, targetY) {
    const b = this._acquire();
    b.x = x;  b.y = y;
    const dx = targetX - x, dy = targetY - y;
    const len = Math.hypot(dx, dy) || 1;
    const sp = CONFIG.BULLET.ENEMY_SPEED;
    b.vx = (dx / len) * sp;
    b.vy = (dy / len) * sp;
    b.w = 6;  b.h = 6;
    b.damage = 1;
    b.from = 'enemy';
    this.enemyBullets.push(b);
    return b;
  }

  update(dt) {
    this._step(this.playerBullets, dt);
    this._step(this.enemyBullets, dt);
    return { playerBullets: this.playerBullets, enemyBullets: this.enemyBullets };
  }

  /**
   * Advance one list and recycle anything fully off-screen. Iterates backwards
   * and swap-removes so culling is O(1) per bullet with no array shifting.
   */
  _step(list, dt) {
    const W = CONFIG.CANVAS.WIDTH, H = CONFIG.CANVAS.HEIGHT;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const hw = b.w / 2, hh = b.h / 2;
      if (b.y + hh < 0 || b.y - hh > H || b.x + hw < 0 || b.x - hw > W) {
        list[i] = list[list.length - 1]; // swap with last…
        list.pop();                       // …then drop the tail
        this.recycle(b);
      }
    }
  }

  draw(ctx) {
    // Player bullets: green bolt with a bright white core for a tracer look.
    for (const b of this.playerBullets) {
      ctx.fillStyle = CONFIG.COLORS.BULLET_PLAYER;
      ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), b.w, b.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(b.x - 1), Math.round(b.y - b.h / 2), 2, b.h);
    }
    // Enemy bullets: red square plug.
    ctx.fillStyle = CONFIG.COLORS.BULLET_ENEMY;
    for (const b of this.enemyBullets) {
      ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h / 2), b.w, b.h);
    }
  }

  /** Recycle every active bullet (used on new game / wave reset). */
  clear() {
    for (const b of this.playerBullets) this.recycle(b);
    for (const b of this.enemyBullets)  this.recycle(b);
    this.playerBullets.length = 0;
    this.enemyBullets.length  = 0;
  }
}
