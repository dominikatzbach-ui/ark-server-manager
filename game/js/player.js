// Player ship — movement, shooting, upgrades, hit-detection.
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    const C = CONFIG.CANVAS;
    this.x = C.WIDTH  / 2;
    this.y = C.HEIGHT - 80;
    this.w = 32;
    this.h = 32;
    this.lives = CONFIG.PLAYER.LIVES;
    this.invincibleTimer = 0;
    this.gunCooldown     = 0;
    // Upgrade levels (managed by Shop)
    this.upgrades = {
      rapid_fire:    0,
      spread_shot:   0,
      double_cannon: 0,
      power_laser:   0,
    };
  }

  /** Returns true when the player can be hurt */
  get vulnerable() { return this.invincibleTimer <= 0; }

  /** Effective cooldown based on rapid_fire upgrade level */
  get fireRate() {
    return CONFIG.PLAYER.GUN_COOLDOWN_MS * Math.pow(0.7, this.upgrades.rapid_fire);
  }

  /**
   * @param {number} dt  delta time in seconds
   * @returns {Bullet[]} newly spawned bullets (may be empty)
   */
  update(dt) {
    // TODO (Step 3): move player, handle shooting, apply invincibility timer
    return [];
  }

  /** Called when a bullet or enemy hits the player */
  hit() {
    // TODO (Step 3/9): lose a life, trigger invincibility, check game over
  }

  draw(ctx) {
    // TODO (Step 3): draw ship shape procedurally with canvas 2D
  }
}
