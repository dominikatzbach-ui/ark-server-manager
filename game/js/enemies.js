// Enemy formation, dive AI, and wave spawning.

class Enemy {
  /**
   * @param {'A'|'B'|'C'} type  determines sprite, HP, score value
   * @param {number} formX  formation slot X (world px)
   * @param {number} formY  formation slot Y (world px)
   */
  constructor(type, formX, formY) {
    this.type    = type;
    this.formX   = formX;   // home position in formation
    this.formY   = formY;
    this.x       = formX;
    this.y       = -40;     // spawn off-screen, fly down to formation
    this.w       = 32;
    this.h       = 28;
    this.hp      = { A: 1, B: 2, C: 3 }[type];
    this.score   = { A: 100, B: 200, C: 400 }[type];
    this.coinDrop = { A: 1, B: 2, C: 4 }[type];
    this.state   = 'entering'; // 'entering' | 'formation' | 'diving' | 'returning'
    this.diveT   = 0;          // bezier parameter 0→1 during dive
    this.divePath = null;       // { p0, p1, p2 } bezier control points
    this.shootTimer = 0;
  }

  /** Returns true when this enemy is dead and should be removed */
  get dead() { return this.hp <= 0; }

  hit(damage = 1) {
    // TODO (Step 7): reduce hp, return true if killed
  }

  /**
   * @param {number} dt  seconds
   * @param {{ x, y }} playerPos
   * @returns {Bullet|null}  enemy bullet if firing this frame
   */
  update(dt, playerPos) {
    // TODO (Steps 5 & 6): handle entering, formation oscillation, diving, returning
    return null;
  }

  draw(ctx) {
    // TODO (Step 5): draw enemy ship procedurally per type
  }
}

// ─────────────────────────────────────────────────────────────────────────────

class EnemyManager {
  constructor() {
    this.enemies    = [];
    this.diveTimer  = 0;
    this.waveNumber = 0;
  }

  /** Spawn a new wave of enemies filling the formation grid */
  spawnWave(waveNumber) {
    // TODO (Step 5): create Enemy instances in ROWS × COLS grid
  }

  /**
   * @param {number} dt
   * @param {{ x, y }} playerPos
   * @param {BulletManager} bullets
   */
  update(dt, playerPos, bullets) {
    // TODO (Steps 5 & 6): update all enemies; trigger dives; pass enemy bullets
  }

  draw(ctx) {
    // TODO (Step 5): forward draw calls
  }

  get allDefeated() {
    return this.enemies.length === 0;
  }
}
