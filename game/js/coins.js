// Coin pickup system — enemies drop coins on death, player collects them.
class CoinManager {
  constructor() {
    this.coins = [];
    this.total = 0; // accumulated coins (persists between waves)
  }

  /** Spawn `amount` coins at world position (x, y) with slight random spread */
  spawn(x, y, amount) {
    // TODO (Step 7): create coin objects {x, y, vx, vy, lifetime, r}
  }

  /**
   * @param {number} dt  seconds
   * @param {{ x, y, w, h }} playerBounds
   * @returns {number}  coins collected this frame
   */
  update(dt, playerBounds) {
    // TODO (Step 7): move coins downward, apply magnet attraction near player,
    //               detect pickup collision, expire old coins
    return 0;
  }

  draw(ctx) {
    // TODO (Step 7): draw golden coins as small circles with shine
  }

  spend(amount) {
    if (this.total < amount) return false;
    this.total -= amount;
    return true;
  }

  reset() {
    this.coins = [];
    // Note: this.total intentionally NOT reset — carries over to new game? TBD.
  }
}
