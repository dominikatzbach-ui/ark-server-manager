// Central game state machine.
// States: 'menu' | 'playing' | 'paused' | 'shop' | 'gameover'
const Game = (() => {
  let state     = STATES.MENU;
  let score     = 0;
  let highscore = 0;
  let wave      = 0;

  // Wave sub-phase: 'playing' while enemies/boss alive, 'clear' during banner
  let wavePhase      = 'playing';
  let wavePhaseTimer = 0;
  const WAVE_CLEAR_DURATION = 2.2;  // seconds

  // Screen shake
  let shakeTimer     = 0;
  let shakeIntensity = 0;

  // Entity instances — created once, reset on new game
  let player;
  let bullets;
  let enemies;
  let boss;
  let coins;
  let powerups;
  let shop;

  function init() {
    highscore = parseInt(localStorage.getItem('rss_highscore') || '0', 10);
    player   = new Player();
    bullets  = new BulletManager();
    enemies  = new EnemyManager();
    boss     = new BossManager();
    coins    = new CoinManager();
    powerups = new PowerupManager();
    shop     = new Shop();
    Renderer.initStars();
    Audio.init();
  }

  function startNewGame() {
    state          = STATES.PLAYING;
    wavePhase      = 'playing';
    wavePhaseTimer = 0;
    score          = 0;
    wave           = 0;
    player.reset();
    bullets.clear();
    coins.reset();
    coins.total = 0;
    powerups.reset();
    boss.reset();
    _nextWave();
  }

  function _nextWave() {
    wave += 1;
    wavePhase      = 'playing';
    wavePhaseTimer = 0;
    bullets.clear();
    coins.reset();
    powerups.reset();
    boss.reset();

    if (wave % 5 === 0) {
      enemies.enemies = [];  // clear any stragglers before boss wave
      boss.spawnBoss(wave);
    } else {
      enemies.spawnWave(wave);
    }
    state = STATES.PLAYING;
  }

  function _openShop() {
    state = STATES.SHOP;
    shop.open();
  }

  /**
   * Main update — called every frame by main.js with delta time.
   * @param {number} dt  seconds since last frame
   */
  function update(dt) {
    Input.poll();
    Renderer.updateStars(dt);

    // Screen shake decay
    if (shakeTimer > 0) shakeTimer -= dt;

    switch (state) {
      case STATES.MENU:
        if (Input.confirmPressed()) {
          Audio.init();  // start AudioContext on first gesture
          startNewGame();
        }
        break;

      case STATES.PLAYING: {
        if (Input.pausePressed()) { state = STATES.PAUSED; break; }

        player.update(dt);

        // Fire — spread shot if power-up/upgrade active
        if (player.wantsFire) {
          const dmg = player.upgrades.power_laser > 0 ? 2 : 1;
          if (player.hasSpread) {
            bullets.spawnSpread(player.gunX, player.gunY, 15, dmg);
          } else if (player.upgrades.double_cannon > 0) {
            bullets.spawnPlayer(player.gunX - 8, player.gunY, 0, dmg);
            bullets.spawnPlayer(player.gunX + 8, player.gunY, 0, dmg);
          } else {
            bullets.spawnPlayer(player.gunX, player.gunY, 0, dmg);
          }
          Audio.shoot();
        }

        bullets.update(dt);

        if (wave % 5 === 0 && boss.active) {
          boss.update(dt, { x: player.x, y: player.y }, bullets);
        } else {
          enemies.update(dt, { x: player.x, y: player.y }, bullets);
        }

        _handleCollisions();
        coins.update(dt, player);

        // Power-up collection
        const picked = powerups.update(dt, player);
        if (picked) {
          player.applyPowerup(picked);
          Audio.powerupPickup();
        }

        // Wave-clear detection
        const waveOver = (wave % 5 === 0) ? boss.defeated : enemies.allDefeated;
        if (wavePhase === 'playing' && waveOver) {
          wavePhase      = 'clear';
          wavePhaseTimer = WAVE_CLEAR_DURATION;
          Audio.waveClear();
        }
        if (wavePhase === 'clear') {
          wavePhaseTimer -= dt;
          if (wavePhaseTimer <= 0) _openShop();
        }

        Renderer.updateParticles(dt);
        if (player.lives <= 0) _gameOver();
        break;
      }

      case STATES.PAUSED:
        if (Input.pausePressed()) state = STATES.PLAYING;
        break;

      case STATES.SHOP:
        if (Input.pausePressed()) _nextWave();   // P / Escape continues to next wave
        else shop.update(coins, player);
        break;

      case STATES.GAMEOVER:
        if (Input.confirmPressed()) startNewGame();
        break;
    }
  }

  function draw(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    Renderer.drawStars(ctx);

    switch (state) {
      case STATES.MENU:
        Renderer.drawStartScreen(ctx);
        break;

      case STATES.PLAYING:
      case STATES.PAUSED: {
        // Screen shake offset
        let sx = 0, sy = 0;
        if (shakeTimer > 0) {
          const mag = shakeIntensity * (shakeTimer / 0.4);
          sx = (Math.random() - 0.5) * mag * 2;
          sy = (Math.random() - 0.5) * mag * 2;
        }
        ctx.save();
        ctx.translate(sx, sy);

        enemies.draw(ctx);
        boss.draw(ctx);
        bullets.draw(ctx);
        player.draw(ctx);
        coins.draw(ctx);
        powerups.draw(ctx);
        Renderer.drawParticles(ctx);

        ctx.restore();

        Renderer.drawHUD(ctx, player, score, wave, coins);
        Renderer.drawPowerupHUD(ctx, player);
        if (boss.active && wave % 5 === 0) Renderer.drawBossHPBar(ctx, boss.boss);
        if (wavePhase === 'clear') {
          Renderer.drawWaveClear(ctx, wavePhaseTimer, WAVE_CLEAR_DURATION, wave);
        }
        if (state === STATES.PAUSED) Renderer.drawPauseScreen(ctx);
        break;
      }

      case STATES.SHOP:
        enemies.draw(ctx);
        player.draw(ctx);
        Renderer.drawHUD(ctx, player, score, wave, coins);
        shop.draw(ctx, coins, player);
        break;

      case STATES.GAMEOVER:
        Renderer.drawGameOverScreen(ctx, score, highscore);
        break;
    }
  }

  /**
   * Resolve all collisions for the frame, using center-based AABB:
   *   1. player bullet → enemy/boss
   *   2. enemy/boss ship → player
   *   3. enemy/boss bullet → player
   */
  function _handleCollisions() {
    const pb = bullets.playerBullets;
    const es = enemies.enemies;

    // 1a ── player bullets vs enemies ─────────────────────────────────────────
    for (let i = pb.length - 1; i >= 0; i--) {
      const b = pb[i];
      let hit = false;

      // Boss hit check (boss wave only)
      if (wave % 5 === 0 && boss.active) {
        const bossObj = boss.boss;
        if (bossObj && Utils.aabbCenter(b, bossObj)) {
          const killed = boss.hit(b.damage);
          bullets.recycle(b);
          pb.splice(i, 1);
          Audio.bossHit();
          if (killed) {
            score += 2000 * (wave / 5);
            Renderer.spawnExplosion(bossObj.x, bossObj.y, '#ff44ff', true);
            Audio.explosion(true);
            powerups.maybeSpawn(bossObj.x, bossObj.y, true);
          }
          hit = true;
        }
      }

      if (hit) continue;

      // Normal enemy hit check
      for (let j = 0; j < es.length; j++) {
        const e = es[j];
        if (e.y + e.h / 2 < 0) continue;
        if (!Utils.aabbCenter(b, e)) continue;

        const killed = e.hit(b.damage);
        bullets.recycle(b);
        pb.splice(i, 1);
        if (killed) {
          score += e.score;
          Renderer.spawnExplosion(e.x, e.y, _enemyColor(e.type));
          Audio.explosion(false);
          coins.spawn(e.x, e.y, e.coinDrop);
          powerups.maybeSpawn(e.x, e.y);
          es.splice(j, 1);
        }
        break;
      }
    }

    // 2 ── enemy ships / boss vs player ───────────────────────────────────────
    if (player.vulnerable) {
      // Normal enemies
      for (let j = es.length - 1; j >= 0; j--) {
        const e = es[j];
        if (e.y + e.h / 2 < 0) continue;
        if (!Utils.aabbCenter(e, player)) continue;
        if (player.hit()) {
          es.splice(j, 1);
          _onPlayerHit();
        }
        break;
      }

      // Boss body collision
      if (wave % 5 === 0 && boss.active) {
        const bossObj = boss.boss;
        if (bossObj && Utils.aabbCenter(bossObj, player)) {
          if (player.hit()) _onPlayerHit();
        }
      }
    }

    // 3 ── enemy bullets vs player ─────────────────────────────────────────────
    const eb = bullets.enemyBullets;
    if (player.vulnerable) {
      for (let i = eb.length - 1; i >= 0; i--) {
        if (!Utils.aabbCenter(eb[i], player)) continue;
        bullets.recycle(eb[i]);
        eb.splice(i, 1);
        if (player.hit()) _onPlayerHit();
        break;
      }
    }
  }

  function _onPlayerHit() {
    shakeTimer     = 0.4;
    shakeIntensity = 14;
    Audio.playerHit();
    Renderer.spawnExplosion(player.x, player.y + 10, CONFIG.COLORS.PLAYER);
  }

  function _enemyColor(type) {
    return { A: CONFIG.COLORS.ENEMY_A, B: CONFIG.COLORS.ENEMY_B, C: CONFIG.COLORS.ENEMY_C }[type];
  }

  function _gameOver() {
    state = STATES.GAMEOVER;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('rss_highscore', highscore);
    }
  }

  function debug() {
    return {
      state, score, wave, wavePhase, player, bullets, enemies, boss, coins, powerups,
      setLives: n => { player.lives = n; },
    };
  }

  return { init, startNewGame, update, draw, debug };
})();
