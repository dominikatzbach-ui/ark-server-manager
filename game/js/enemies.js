// ── Sprite data ────────────────────────────────────────────────────────────────
// All sprites share scale 4 (each pixel = 4×4 screen px). 'X' = body colour.
const _ES = 4;

const _ESPRITE = {
  //  Type A — small red basic enemy (6 cols × 5 rows → 24×20 on screen)
  A: ['.X..X.',
      'XXXXXX',
      '.XXXX.',
      'X.XX.X',
      '.X..X.'],

  //  Type B — medium orange fighter (8 cols × 6 rows → 32×24)
  B: ['.X....X.',
      '.XXXXXX.',
      'XXXXXXXX',
      'XXXXXXXX',
      '.X.XX.X.',
      '..X..X..'],

  //  Type C — heavy purple flagship (8 cols × 7 rows → 32×28)
  C: ['...XX...',
      '.XXXXXX.',
      'XXXXXXXX',
      'X.XXXX.X',
      'XXXXXXXX',
      '.XX..XX.',
      '..X..X..'],
};

const _ECOLOR = {
  A: CONFIG.COLORS.ENEMY_A,   // '#ff4444'
  B: CONFIG.COLORS.ENEMY_B,   // '#ff9900'
  C: CONFIG.COLORS.ENEMY_C,   // '#cc44ff'
};

// Row type assigned per formation row (0 = top / most valuable)
const _ROW_TYPE = ['C', 'B', 'B', 'A'];

// ── Enemy ──────────────────────────────────────────────────────────────────────
class Enemy {
  constructor(type, formX, formY) {
    this.type  = type;
    this.formX = formX;   // fixed formation slot (world px)
    this.formY = formY;

    const cols = _ESPRITE[type][0].length;
    const rows = _ESPRITE[type].length;
    this.w = cols * _ES;  // used for AABB collision (Step 7)
    this.h = rows * _ES;

    this.hp       = { A: 1, B: 2, C: 3 }[type];
    this.score    = { A: 100, B: 200, C: 400 }[type];
    this.coinDrop = { A: 1,  B: 2,  C: 4  }[type];

    // Logical position — only this.x / this.y are used for collision and dive
    // start. The formation bob is applied in draw() only so the hitbox stays steady.
    this.x = formX;
    this.y = -80;

    // Entry animation
    this.entryDelay    = 0;    // seconds to wait before starting entry
    this.entryTimer    = 0;    // time spent entering
    this.entryDuration = 1.2;  // seconds to reach formation slot
    this.spawnX        = formX;
    this.spawnY        = -80;

    this.state = 'entering';   // 'entering' | 'formation' | 'diving'

    // Dive path (set by startDive)
    this.diveT        = 0;
    this.diveDuration = 2.5;  // seconds for full bezier arc
    this.divePath     = null; // { p0, p1, p2 }

    this.shootTimer = 0;
  }

  get dead() { return this.hp <= 0; }

  /** Returns true if the hit kills the enemy. */
  hit(damage = 1) {
    this.hp -= damage;
    return this.dead;
  }

  /**
   * @param {number} dt
   * @param {{ x, y }} playerPos
   * @param {number} formOffX  current formation-wide X offset (oscillation)
   */
  update(dt, playerPos, formOffX) {
    switch (this.state) {

      case 'entering': {
        this.entryDelay -= dt;
        if (this.entryDelay > 0) break;

        this.entryTimer += dt;
        const t = Math.min(1, this.entryTimer / this.entryDuration);
        // Ease-in-out cubic so the entry decelerates smoothly into the slot.
        const ease = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
        this.x = this.spawnX + (this.formX + formOffX - this.spawnX) * ease;
        this.y = this.spawnY + (this.formY - this.spawnY) * ease;
        if (t >= 1) {
          this.x     = this.formX + formOffX;
          this.y     = this.formY;
          this.state = 'formation';
        }
        break;
      }

      case 'formation': {
        // Follow the formation oscillation. Bob is cosmetic — kept in draw().
        this.x = this.formX + formOffX;
        this.y = this.formY;
        break;
      }

      case 'diving': {
        // Safety net: a diving enemy must always have a path. If something put
        // it in this state without one, calmly rejoin the formation.
        if (!this.divePath) {
          this.x = this.formX + formOffX;
          this.y = this.formY;
          this.state = 'formation';
          break;
        }

        this.diveT += dt / this.diveDuration;

        // Exited screen or bezier complete → rejoin formation from above
        if (this.diveT >= 1 || this.y > CONFIG.CANVAS.HEIGHT + 90) {
          this.x           = this.formX + formOffX;
          this.y           = -80;
          this.spawnX      = this.x;
          this.spawnY      = -80;
          this.entryTimer  = 0;
          this.entryDelay  = 0.4;
          this.state       = 'entering';
          break;
        }

        // Quadratic bezier  B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
        const { p0, p1, p2 } = this.divePath;
        const mt = 1 - this.diveT;
        const t  = this.diveT;
        this.x = mt*mt*p0.x + 2*mt*t*p1.x + t*t*p2.x;
        this.y = mt*mt*p0.y + 2*mt*t*p1.y + t*t*p2.y;
        break;
      }
    }
  }

  /**
   * Start a Galaga-style sweeping dive:
   * sidestep away from the player's side, then curve toward them and exit below.
   */
  startDive(playerPos) {
    this.state    = 'diving';
    this.diveT    = 0;
    const p0      = { x: this.x, y: this.y };
    // Control point sweeps to the opposite side from the player to create a curve
    const sweepDir = (playerPos.x < this.x) ? 1 : -1;
    const p1 = {
      x: this.x + sweepDir * 200,
      y: Math.min(this.y + 200, CONFIG.CANVAS.HEIGHT * 0.52),
    };
    const p2 = {
      x: playerPos.x + (Math.random() - 0.5) * 100,
      y: CONFIG.CANVAS.HEIGHT + 90,
    };
    this.divePath = { p0, p1, p2 };
  }

  draw(ctx) {
    const rows = _ESPRITE[this.type];
    const cols = rows[0].length;
    const sw   = cols * _ES;
    const sh   = rows.length * _ES;

    // Apply formation bob purely in draw so the collision box stays at this.y
    const bobY = (this.state === 'formation')
      ? Math.sin(performance.now() / 900 + this.formX * 0.02) * 4
      : 0;

    const ox = Math.round(this.x - sw / 2);
    const oy = Math.round(this.y + bobY - sh / 2);

    ctx.fillStyle = _ECOLOR[this.type];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < cols; c++) {
        if (row[c] !== 'X') continue;
        ctx.fillRect(ox + c * _ES, oy + r * _ES, _ES, _ES);
      }
    }
  }
}

// ── EnemyManager ──────────────────────────────────────────────────────────────
class EnemyManager {
  constructor() {
    this.enemies       = [];
    this.waveNumber    = 0;
    this.diveTimer     = 0;
    this.formationOffX = 0;  // current formation-wide X offset
    this.formationVX   = 30; // px/s — increases with wave number
  }

  /** Spawn a fresh formation for the given wave. Higher waves are faster/more aggressive. */
  spawnWave(waveNumber) {
    this.waveNumber    = waveNumber;
    this.enemies       = [];
    this.formationOffX = 0;
    this.formationVX   = 30 + (waveNumber - 1) * 6;  // +6 px/s each wave
    this.diveTimer     = CONFIG.ENEMY.DIVE_INTERVAL_MS / 1000;

    const { FORMATION_ROWS, FORMATION_COLS, CELL_W, CELL_H, OFFSET_X, OFFSET_Y }
      = CONFIG.ENEMY;

    let idx = 0;
    for (let row = 0; row < FORMATION_ROWS; row++) {
      const type = _ROW_TYPE[Math.min(row, _ROW_TYPE.length - 1)];
      for (let col = 0; col < FORMATION_COLS; col++) {
        const formX = OFFSET_X + col * CELL_W + CELL_W / 2;
        const formY = OFFSET_Y + row * CELL_H + CELL_H / 2;
        const e     = new Enemy(type, formX, formY);

        // Stagger entry: 40ms between each enemy, columns zip in first (left→right,
        // then next row), so the formation fills in from left to right, row by row.
        e.entryDelay    = idx * 0.04;
        e.spawnX        = formX;  // fly straight down from above formation slot
        e.spawnY        = -80;
        e.x             = formX;
        e.y             = -80;

        this.enemies.push(e);
        idx++;
      }
    }
  }

  /**
   * @param {number} dt
   * @param {{ x, y }} playerPos
   * @param {BulletManager} bullets  (used for enemy shooting — Step 6)
   */
  update(dt, playerPos, bullets) {
    // ── Formation oscillation ──────────────────────────────────────────────
    // The whole formation drifts left-right; reverses when it hits the limit.
    const oscLimit = 90;
    this.formationOffX += this.formationVX * dt;
    if (Math.abs(this.formationOffX) >= oscLimit) {
      this.formationVX    = -this.formationVX;
      this.formationOffX  = Math.sign(this.formationOffX) * oscLimit;
    }

    // ── Dive trigger ──────────────────────────────────────────────────────
    this.diveTimer -= dt;
    if (this.diveTimer <= 0) {
      this._triggerDive(playerPos);
      // Each wave shortens the interval (floor at 0.6s)
      const base     = CONFIG.ENEMY.DIVE_INTERVAL_MS / 1000;
      const scale    = Math.max(0.4, 1 - (this.waveNumber - 1) * 0.08);
      this.diveTimer = base * scale;
    }

    // ── Update each enemy ─────────────────────────────────────────────────
    for (const e of this.enemies) {
      e.update(dt, playerPos, this.formationOffX);
    }
    // Dead enemies are removed in Step 7 (collision + hit detection)
  }

  /** Pick a random formation enemy and send it on a dive. */
  _triggerDive(playerPos) {
    const pool = this.enemies.filter(e => e.state === 'formation');
    if (pool.length === 0) return;
    const diver = pool[Math.floor(Math.random() * pool.length)];
    diver.startDive(playerPos);
  }

  draw(ctx) {
    for (const e of this.enemies) e.draw(ctx);
  }

  /** True once all enemies are destroyed (used to trigger wave-clear in Step 8). */
  get allDefeated() {
    return this.enemies.length === 0;
  }
}
