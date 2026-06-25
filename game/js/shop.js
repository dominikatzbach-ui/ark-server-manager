// Between-wave upgrade shop.
// Enters when wave cleared (called from game.js state machine).
class Shop {
  constructor() {
    this.selectedIndex = 0;
  }

  /** Reset cursor when shop opens. */
  open() {
    this.selectedIndex = 0;
  }

  update(coins, player) {
    const upgrades = CONFIG.SHOP.UPGRADES;

    // Use edge-triggered presses for clean single-step navigation
    if (Input.isPressed('ArrowUp') || Input.isPressed('KeyW')) {
      this.selectedIndex = (this.selectedIndex - 1 + upgrades.length) % upgrades.length;
    } else if (Input.isPressed('ArrowDown') || Input.isPressed('KeyS')) {
      this.selectedIndex = (this.selectedIndex + 1) % upgrades.length;
    }

    if (Input.isPressed('Enter')) {
      this._buy(upgrades[this.selectedIndex], player, coins);
    }
  }

  draw(ctx, coins, player) {
    const W = CONFIG.CANVAS.WIDTH;
    const H = CONFIG.CANVAS.HEIGHT;

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 30, 0.82)';
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle   = CONFIG.COLORS.SCORE;
    ctx.font        = 'bold 36px "Courier New", monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UPGRADE SHOP', W / 2, 80);

    ctx.fillStyle = CONFIG.COLORS.COIN;
    ctx.font      = 'bold 22px "Courier New", monospace';
    ctx.fillText(`◆ ${coins.total} COINS`, W / 2, 126);

    // Upgrade cards
    const cardW  = 480;
    const cardH  = 72;
    const startY = 180;
    const gap    = 84;
    const upgrades = CONFIG.SHOP.UPGRADES;

    for (let i = 0; i < upgrades.length; i++) {
      const u      = upgrades[i];
      const level  = player.upgrades[u.id] || 0;
      const maxed  = level >= u.maxLevel;
      const afford = coins.total >= u.cost && !maxed;
      const sel    = i === this.selectedIndex;
      const cx     = W / 2;
      const cy     = startY + i * gap + cardH / 2;

      // Card background
      ctx.fillStyle = sel ? 'rgba(255, 220, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

      // Border
      ctx.strokeStyle = sel ? CONFIG.COLORS.SCORE : 'rgba(255,255,255,0.2)';
      ctx.lineWidth   = sel ? 2 : 1;
      ctx.strokeRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH);

      // Upgrade label
      ctx.fillStyle   = maxed ? '#888888' : '#ffffff';
      ctx.font        = `bold 18px "Courier New", monospace`;
      ctx.textAlign   = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(u.label, cx - cardW / 2 + 16, cy - 10);

      // Level pips
      const pipSize = 12;
      for (let lvl = 0; lvl < u.maxLevel; lvl++) {
        ctx.fillStyle = lvl < level ? CONFIG.COLORS.SCORE : 'rgba(255,255,255,0.2)';
        ctx.fillRect(cx - cardW / 2 + 16 + lvl * (pipSize + 4), cy + 10, pipSize, pipSize);
      }

      // Cost or status
      ctx.textAlign = 'right';
      if (maxed) {
        ctx.fillStyle = '#888888';
        ctx.font      = 'bold 16px "Courier New", monospace';
        ctx.fillText('MAXED', cx + cardW / 2 - 16, cy);
      } else {
        ctx.fillStyle = afford ? CONFIG.COLORS.COIN : '#884444';
        ctx.font      = 'bold 20px "Courier New", monospace';
        ctx.fillText(`◆ ${u.cost}`, cx + cardW / 2 - 16, cy);
      }
    }

    // Footer hint
    ctx.fillStyle   = 'rgba(255,255,255,0.45)';
    ctx.font        = '15px "Courier New", monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('↑↓ NAVIGATE   ENTER BUY   P SKIP', W / 2, H - 20);
  }

  _buy(upgrade, player, coins) {
    const level = player.upgrades[upgrade.id] || 0;
    if (level >= upgrade.maxLevel) return;
    if (!coins.spend(upgrade.cost)) return;
    player.upgrades[upgrade.id] = level + 1;
  }
}
