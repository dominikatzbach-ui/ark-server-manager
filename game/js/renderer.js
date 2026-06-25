// Static drawing utilities — starfield background, HUD, screens.
// Entity drawing lives in each entity's own draw() method.
const Renderer = (() => {
  const W = CONFIG.CANVAS.WIDTH;
  const H = CONFIG.CANVAS.HEIGHT;

  // ── Starfield ──────────────────────────────────────────────────────────────
  // Parallax: each star carries the speed/size/brightness of its layer so a
  // single flat array can be updated and drawn in one pass.
  let stars = [];

  function initStars() {
    stars = [];
    for (const layer of CONFIG.STARFIELD.LAYERS) {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          speed: layer.speed,
          size: layer.size,
          brightness: layer.brightness,
        });
      }
    }
  }

  /** Scroll stars downward (= ship moving up); wrap past the bottom to the top. */
  function updateStars(dt) {
    for (const s of stars) {
      s.y += s.speed * dt;
      if (s.y > H) {
        s.y = 0;
        s.x = Math.random() * W; // new column so it doesn't look like rails
      }
    }
  }

  function drawStars(ctx) {
    for (const s of stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
      ctx.fillRect(s.x | 0, s.y | 0, s.size, s.size);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  /** 1 Hz on/off blink for prompts. */
  function blink() {
    return Math.floor(performance.now() / 500) % 2 === 0;
  }

  function centerText(ctx, text, y, size, color, font = 'Courier New') {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px ${font}, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, W / 2, y);
  }

  // ── HUD ──────────────────────────────────────────────────────────────────
  function drawHUD(ctx, player, score, wave, coins) {
    ctx.textBaseline = 'top';
    ctx.font = 'bold 20px "Courier New", monospace';

    ctx.textAlign = 'left';
    ctx.fillStyle = CONFIG.COLORS.SCORE;
    ctx.fillText(`SCORE ${String(score).padStart(6, '0')}`, 16, 14);

    ctx.fillStyle = CONFIG.COLORS.COIN;
    ctx.fillText(`◆ ${coins ? coins.total : 0}`, 16, 40);

    ctx.textAlign = 'center';
    ctx.fillStyle = CONFIG.COLORS.HUD;
    ctx.fillText(`WAVE ${wave}`, W / 2, 14);

    ctx.textAlign = 'right';
    ctx.fillStyle = CONFIG.COLORS.PLAYER;
    const lives = player ? player.lives : 0;
    ctx.fillText('▲ '.repeat(Math.max(0, lives)).trim(), W - 16, 14);
  }

  // ── Screens ────────────────────────────────────────────────────────────────
  function drawStartScreen(ctx) {
    centerText(ctx, 'RETRO SPACE SHOOTER', H / 2 - 60, 48, CONFIG.COLORS.PLAYER);
    if (blink()) {
      centerText(ctx, 'PRESS ENTER TO START', H / 2 + 20, 24, CONFIG.COLORS.HUD);
    }
    centerText(ctx, 'WASD / ARROWS  ·  SPACE TO FIRE  ·  P TO PAUSE',
      H / 2 + 80, 16, 'rgba(255,255,255,0.5)');
  }

  function drawGameOverScreen(ctx, score, highscore) {
    centerText(ctx, 'GAME OVER', H / 2 - 60, 56, CONFIG.COLORS.ENEMY_A);
    centerText(ctx, `SCORE ${score}`, H / 2 + 10, 28, CONFIG.COLORS.SCORE);
    centerText(ctx, `BEST  ${highscore}`, H / 2 + 48, 22, CONFIG.COLORS.HUD);
    if (blink()) {
      centerText(ctx, 'PRESS ENTER TO RESTART', H / 2 + 110, 20,
        'rgba(255,255,255,0.7)');
    }
  }

  function drawPauseScreen(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    centerText(ctx, 'PAUSED', H / 2, 48, CONFIG.COLORS.HUD);
    centerText(ctx, 'PRESS P TO RESUME', H / 2 + 50, 18,
      'rgba(255,255,255,0.6)');
  }

  // ── Wave-clear banner ─────────────────────────────────────────────────────
  /**
   * Fade-in / fade-out banner shown between waves.
   * @param {number} timer      seconds remaining in the wave-clear phase
   * @param {number} maxTimer   total duration of the wave-clear phase
   * @param {number} wave       wave number that was just cleared
   */
  function drawWaveClear(ctx, timer, maxTimer, wave) {
    // Fade in during first 20%, fade out during last 30%
    const elapsed = maxTimer - timer;
    let alpha;
    if (elapsed < maxTimer * 0.2) {
      alpha = elapsed / (maxTimer * 0.2);
    } else if (timer < maxTimer * 0.3) {
      alpha = timer / (maxTimer * 0.3);
    } else {
      alpha = 1;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    centerText(ctx, `WAVE ${wave} CLEAR`, H / 2 - 20, 40, CONFIG.COLORS.SCORE);
    ctx.globalAlpha = alpha * 0.7;
    centerText(ctx, `WAVE ${wave + 1} INCOMING`, H / 2 + 32, 22, CONFIG.COLORS.HUD);
    ctx.restore();
  }

  // ── Explosion particles (purely visual) ──────────────────────────────────
  let particles = [];

  function spawnExplosion(x, y, color) {
    // TODO (Step 10): push particle objects
  }

  function updateParticles(dt) {
    // TODO (Step 10): age and remove dead particles
  }

  function drawParticles(ctx) {
    // TODO (Step 10): draw each particle
  }

  return {
    initStars, updateStars, drawStars,
    drawHUD, drawStartScreen, drawGameOverScreen, drawPauseScreen, drawWaveClear,
    spawnExplosion, updateParticles, drawParticles,
  };
})();
