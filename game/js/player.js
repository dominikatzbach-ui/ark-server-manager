// ── Ship pixel-art sprite ─────────────────────────────────────────────────────
// 14 cols × 17 rows; each "pixel" is rendered as a SCALE×SCALE screen block.
// Chars map to PALETTE below. '.' = transparent.
const _SS = 3; // sprite scale (px per sprite-pixel)
const _SP = {
  'B': '#60ffd0',  // gun barrel  (bright mint)
  'C': '#00d4f0',  // body        (matches COLORS.PLAYER shade)
  'K': '#b0f0ff',  // cockpit glass (lighter cyan)
  'W': '#ffffff',  // wing highlight
  'Y': '#ffdd00',  // engine glow (yellow)
  'O': '#ff7700',  // exhaust     (orange)
};
const _SG = [            // sprite rows, 14 chars each
  '......BB......',      //  0 – gun tip
  '.....BBBB.....',      //  1 – gun barrel
  '.....CCCC.....',      //  2 – body
  '....CCCCCC....',      //  3 – body widens
  '...CCKKKKCC...',      //  4 – cockpit window
  '...CCKKKKCC...',      //  5
  '...CCKKKKCC...',      //  6
  '...CCCCCCCC...',      //  7 – body
  '..CCCCCCCCCC..',      //  8 – body widens
  '.WCCCCCCCCCCW.',      //  9 – wing root
  'WWCCCCCCCCCCWW',      // 10 – max wing span
  '.WCCCCCCCCCCW.',      // 11 – wing root
  '..CCCCCCCCCC..',      // 12 – body narrows
  '..CCC....CCC..',      // 13 – twin engine pods form
  '..YYY....YYY..',      // 14 – engine glow
  '.OOOO....OOOO.',      // 15 – exhaust
  '..OO......OO..',      // 16 – exhaust fade
];
// sprite pixel dimensions
const _SW = _SG[0].length * _SS;   // 14 * 3 = 42
const _SH = _SG.length   * _SS;   // 17 * 3 = 51

// ── Player class ──────────────────────────────────────────────────────────────
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = CONFIG.CANVAS.WIDTH  / 2;
    this.y = CONFIG.CANVAS.HEIGHT - 90;
    this.w = _SW;   // 42  — also used for boundary clamping
    this.h = _SH;   // 51
    this.lives           = CONFIG.PLAYER.LIVES;
    this.invincibleTimer = 0;  // seconds remaining
    this.gunCooldown     = 0;  // seconds remaining
    this.wantsFire       = false;  // set each frame; game.js reads to spawn bullets
    this.upgrades = {
      rapid_fire:    0,
      spread_shot:   0,
      double_cannon: 0,
      power_laser:   0,
    };
  }

  get vulnerable()   { return this.invincibleTimer <= 0; }
  get fireRate()     { return CONFIG.PLAYER.GUN_COOLDOWN_MS * Math.pow(0.7, this.upgrades.rapid_fire) / 1000; }

  // Bullet spawn anchor — top-center of sprite (gun tip)
  get gunX() { return this.x; }
  get gunY() { return this.y - _SH / 2; }

  update(dt) {
    // ── Movement ────────────────────────────────────────────────────────────
    const { dx, dy } = Input.moveVector();
    this.x += dx * CONFIG.PLAYER.SPEED * dt;
    this.y += dy * CONFIG.PLAYER.SPEED * dt;

    // Clamp to canvas edges (half-sprite margin so ship never clips the border)
    const hw = _SW / 2, hh = _SH / 2;
    const W = CONFIG.CANVAS.WIDTH, H = CONFIG.CANVAS.HEIGHT;
    if (this.x < hw)     this.x = hw;
    if (this.x > W - hw) this.x = W - hw;
    if (this.y < hh)     this.y = hh;
    if (this.y > H - hh) this.y = H - hh;

    // ── Timers ───────────────────────────────────────────────────────────────
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.gunCooldown     > 0) this.gunCooldown     -= dt;

    // ── Fire intent ──────────────────────────────────────────────────────────
    // game.js reads this.wantsFire and calls bullets.spawnPlayer() each frame.
    this.wantsFire = Input.shooting() && this.gunCooldown <= 0;
    if (this.wantsFire) this.gunCooldown = this.fireRate;
  }

  /**
   * Subtract a life and trigger invincibility. Call from collision code.
   * @returns {boolean} true if a life was actually lost (false if invincible)
   */
  hit() {
    if (!this.vulnerable) return false;
    this.lives -= 1;
    this.invincibleTimer = CONFIG.PLAYER.INVINCIBLE_MS / 1000;
    return true;
  }

  draw(ctx) {
    // Flicker during invincibility: toggle visibility every 6 sim frames (≈100ms)
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 10) % 2 === 0) return;

    const ox = Math.round(this.x - _SW / 2);
    const oy = Math.round(this.y - _SH / 2);

    for (let r = 0; r < _SG.length; r++) {
      const row = _SG[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.') continue;
        ctx.fillStyle = _SP[ch];
        ctx.fillRect(ox + c * _SS, oy + r * _SS, _SS, _SS);
      }
    }

    // Engine exhaust glow — soft orange halo beneath the pods
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(performance.now() / 80);
    ctx.fillStyle = '#ff8800';
    const ex = ox + Math.round(_SW * 0.5);
    const ey = oy + _SH + 2;
    ctx.fillRect(ox + 6,         ey,  9, 4);   // left pod glow
    ctx.fillRect(ox + _SW - 15, ey,  9, 4);   // right pod glow
    ctx.restore();
  }
}
