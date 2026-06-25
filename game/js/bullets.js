// Manages all active bullets (player + enemy).
// Keeps two pools to avoid repeated array allocation.
class BulletManager {
  constructor() {
    this.playerBullets = [];
    this.enemyBullets  = [];
  }

  /** Spawn a player bullet at (x, y) with optional angle offset for spread */
  spawnPlayer(x, y, angleOffset = 0) {
    // TODO (Step 4): push a bullet object {x, y, vx, vy, w, h, damage}
  }

  /** Spawn an enemy bullet aimed toward target position */
  spawnEnemy(x, y, targetX, targetY) {
    // TODO (Step 4): push a bullet aimed at player
  }

  /**
   * @param {number} dt  seconds
   * @returns {{ playerBullets, enemyBullets }} current lists after culling
   */
  update(dt) {
    // TODO (Step 4): move bullets, cull off-screen
    return { playerBullets: this.playerBullets, enemyBullets: this.enemyBullets };
  }

  draw(ctx) {
    // TODO (Step 4): draw each bullet as a colored rectangle / glow
  }

  clear() {
    this.playerBullets = [];
    this.enemyBullets  = [];
  }
}
