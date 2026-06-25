// Boss sprite — 16 cols × 12 rows, rendered at scale 5 (80×60 on screen)
const _BS = 5;
const _BSPRITE = [
  '....XXXXXXXX....',
  '..XXXXXXXXXXXX..',
  '.XXXXXXXXXXXXXX.',
  'XXXXXXXXXXXXXXXX',
  'XX.XXXXXXXXXX.XX',
  'XX.X.XXXXXX.X.XX',
  'XX.XXXXXXXXXX.XX',
  'XXXXXXXXXXXXXXXX',
  '.XX.XXXXXXXX.XX.',
  '....XX....XX....',
  '....X......X....',
  '....XX....XX....',
];
const _BW = _BSPRITE[0].length * _BS; // 80
const _BH = _BSPRITE.length   * _BS; // 60

class Boss {
  constructor(bossNumber) {
    this.bossNumber = bossNumber;
    this.x  = CONFIG.CANVAS.WIDTH / 2;
    this.y  = -80;
    this.w  = _BW;
    this.h  = _BH;
    this.maxHp = 50 + (bossNumber - 1) * 30;
    this.hp    = this.maxHp;

    // Movement
    this.vx         = 90;
    this.vy         = 0;
    this.entryDone  = false;
    this.targetY    = 100;

    // Attack
    this.shootTimer = 0;
    this.shootInterval = Math.max(0.8, 1.8 - (bossNumber - 1) * 0.15);
    this.phase2     = false; // true at 50% HP — extra diagonal bullets

    this.dead = false;
  }

  get defeated() { return this.hp <= 0; }

  hit(damage = 1) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp   = 0;
      this.dead = true;
    }
    if (!this.phase2 && this.hp <= this.maxHp * 0.5) {
      this.phase2 = true;
    }
    return this.dead;
  }

  /**
   * @param {number} dt
   * @param {{ x, y }} playerPos
   * @param {BulletManager} bullets
   */
  update(dt, playerPos, bullets) {
    // ── Entry sweep down from top ─────────────────────────────────────────
    if (!this.entryDone) {
      this.y += 120 * dt;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entryDone = true;
      }
      return;
    }

    // ── Horizontal sweep, reverse at edges ────────────────────────────────
    const margin = _BW / 2 + 20;
    this.x += this.vx * dt;
    if (this.x > CONFIG.CANVAS.WIDTH - margin) {
      this.x  = CONFIG.CANVAS.WIDTH - margin;
      this.vx = -Math.abs(this.vx);
    }
    if (this.x < margin) {
      this.x  = margin;
      this.vx =  Math.abs(this.vx);
    }

    // Vertical drift — slight sine bob
    this.y = this.targetY + Math.sin(performance.now() / 1200) * 14;

    // ── Shooting ──────────────────────────────────────────────────────────
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.shootTimer = this.shootInterval;
      _bossShoot(this, playerPos, bullets);
    }
  }

  draw(ctx) {
    // Flash white when hit recently (tracked by game.js via hitFlash)
    const color = this.hitFlash > 0 ? '#ffffff' : '#ff44ff';
    if (this.hitFlash > 0) this.hitFlash -= 1;

    const ox = Math.round(this.x - _BW / 2);
    const oy = Math.round(this.y - _BH / 2);

    ctx.fillStyle = color;
    for (let r = 0; r < _BSPRITE.length; r++) {
      const row = _BSPRITE[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== 'X') continue;
        ctx.fillRect(ox + c * _BS, oy + r * _BS, _BS, _BS);
      }
    }

    // Engine glow
    ctx.save();
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(performance.now() / 100);
    ctx.fillStyle   = '#ff44ff';
    ctx.fillRect(ox + 18, oy + _BH,     8, 6);
    ctx.fillRect(ox + _BW - 26, oy + _BH, 8, 6);
    ctx.restore();
  }
}

/** Fire a spread pattern toward the player, more bullets in phase 2. */
function _bossShoot(boss, playerPos, bullets) {
  const bx = boss.x;
  const by = boss.y + boss.h / 2;

  // Always fire 3-way aimed burst
  const angles = [-0.25, 0, 0.25];
  const dx = playerPos.x - bx;
  const dy = playerPos.y - by;
  const baseAngle = Math.atan2(dy, dx);

  for (const offset of angles) {
    const a = baseAngle + offset;
    bullets.spawnEnemy(bx, by, bx + Math.cos(a) * 100, by + Math.sin(a) * 100);
  }

  // Phase 2: extra diagonal shots outward
  if (boss.phase2) {
    bullets.spawnEnemy(bx, by, bx - 200, by + 150);
    bullets.spawnEnemy(bx, by, bx + 200, by + 150);
  }
}

// ── BossManager ──────────────────────────────────────────────────────────────
class BossManager {
  constructor() {
    this.boss = null;
  }

  /** Spawn boss for the given wave (call only on wave % 5 === 0). */
  spawnBoss(waveNumber) {
    const bossNumber = waveNumber / 5;
    this.boss = new Boss(bossNumber);
    this.boss.hitFlash = 0;
  }

  get active() { return this.boss !== null && !this.boss.defeated; }
  get defeated() { return this.boss !== null && this.boss.defeated; }

  update(dt, playerPos, bullets) {
    if (this.boss && !this.boss.defeated) {
      this.boss.update(dt, playerPos, bullets);
    }
  }

  /** @returns {boolean} true if the hit killed the boss */
  hit(damage = 1) {
    if (!this.boss) return false;
    const killed = this.boss.hit(damage);
    this.boss.hitFlash = 4;
    return killed;
  }

  draw(ctx) {
    if (this.boss && !this.boss.defeated) this.boss.draw(ctx);
  }

  reset() {
    this.boss = null;
  }
}
