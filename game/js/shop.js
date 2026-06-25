// Between-wave upgrade shop — pauses game, shows upgrade menu.
// Communicates with CoinManager and Player.
class Shop {
  constructor() {
    this.visible = false;
    this.selectedIndex = 0;
  }

  /** Open the shop after a wave is cleared */
  open() {
    // TODO (Step 8): set visible, reset cursor
  }

  /** Close shop and resume game */
  close() {
    // TODO (Step 8): set visible false
  }

  /**
   * Handle shop input and purchases.
   * @param {CoinManager} coins
   * @param {Player} player
   */
  update(coins, player) {
    // TODO (Step 8): arrow key navigation, Enter to buy, Escape/P to skip
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {CoinManager} coins
   * @param {Player} player
   */
  draw(ctx, coins, player) {
    // TODO (Step 8): semi-transparent overlay, upgrade cards with cost, level,
    //               current-level indicator, "MAXED" label
  }

  /**
   * Apply purchased upgrade to player.
   * @param {string} upgradeId
   * @param {Player} player
   * @param {CoinManager} coins
   */
  _buy(upgradeId, player, coins) {
    // TODO (Step 8): look up upgrade in CONFIG.SHOP.UPGRADES, deduct coins,
    //               increment player.upgrades[upgradeId]
  }
}
