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

  // ── Explosion particles ──────────────────────────────────────────────────
  let particles = [];

  /**
   * Burst `count` particles at (x, y) in the given color.
   * @param {boolean} big  true for boss-sized explosion
   */
  function spawnExplosion(x, y, color, big = false) {
    const count = big ? 28 : 14;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = big
        ? 60 + Math.random() * 200
        : 40 + Math.random() * 120;
      particles.push({
        x,
        y,
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        life:    big ? 0.9 + Math.random() * 0.5 : 0.5 + Math.random() * 0.4,
        maxLife: 0,   // filled below
        r:       big ? 2 + Math.random() * 4 : 1 + Math.random() * 3,
        color,
      });
      particles[particles.length - 1].maxLife = particles[particles.length - 1].life;
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vx *= Math.pow(0.88, dt * 60);
      p.vy *= Math.pow(0.88, dt * 60);
      p.life -= dt;
      if (p.life <= 0) {
        particles[i] = particles[particles.length - 1];
        particles.pop();
      }
    }
  }

  function drawParticles(ctx) {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle   = p.color;
      ctx.fillRect(Math.round(p.x - p.r), Math.round(p.y - p.r), p.r * 2, p.r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ── Boss HP bar ──────────────────────────────────────────────────────────
  function drawBossHPBar(ctx, boss) {
    const barW  = 400;
    const barH  = 14;
    const bx    = W / 2 - barW / 2;
    const by    = H - 36;
    const frac  = Math.max(0, boss.hp / boss.maxHp);
    const phase2 = boss.hp <= boss.maxHp * 0.5;

    // Background track
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);

    // Fill — turns red in phase 2
    ctx.fillStyle = phase2 ? '#ff2222' : '#cc44ff';
    ctx.fillRect(bx, by, Math.round(barW * frac), barH);

    // Border
    ctx.strokeStyle = phase2 ? '#ff6666' : '#ff44ff';
    ctx.lineWidth   = 2;
    ctx.strokeRect(bx, by, barW, barH);

    // Label
    ctx.fillStyle   = '#ffffff';
    ctx.font        = 'bold 12px "Courier New", monospace';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`BOSS ${phase2 ? '⚠ PHASE 2' : ''}`, W / 2, by - 12);
  }

  // ── Power-up HUD ──────────────────────────────────────────────────────────
  function drawPowerupHUD(ctx, player) {
    let offsetY = 70;
    ctx.font         = 'bold 14px "Courier New", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign    = 'left';

    if (player.shieldTimer > 0) {
      ctx.fillStyle = '#00ccff';
      ctx.fillText(`SHIELD ${Math.ceil(player.shieldTimer)}s`, 16, offsetY);
      offsetY += 22;
    }
    if (player.spreadTimer > 0) {
      ctx.fillStyle = '#ff9900';
      ctx.fillText(`SPREAD ${Math.ceil(player.spreadTimer)}s`, 16, offsetY);
    }
  }

  return {
    initStars, updateStars, drawStars,
    drawHUD, drawStartScreen, drawGameOverScreen, drawPauseScreen, drawWaveClear,
    drawBossHPBar, drawPowerupHUD,
    spawnExplosion, updateParticles, drawParticles,
  };
})();
