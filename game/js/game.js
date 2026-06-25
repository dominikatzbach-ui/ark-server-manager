// Central game state machine.
// States: 'start' | 'playing' | 'paused' | 'shop' | 'gameover'
const Game = (() => {
  let state    = STATES.MENU;
  let score    = 0;
  let highscore = 0;
  let wave     = 0;

  // Wave sub-phase: 'playing' while enemies are alive, 'clear' during the
  // banner countdown before the next wave spawns.
  let wavePhase      = 'playing';
  let wavePhaseTimer = 0;
  const WAVE_CLEAR_DURATION = 2.2; // seconds

  // Entity instances — created once, reset on new game
  let player;
  let bullets;
  let enemies;
  let coins;
  let shop;

  function init() {
    highscore = parseInt(localStorage.getItem('rss_highscore') || '0', 10);
    player  = new Player();
    bullets = new BulletManager();
    enemies = new EnemyManager();
    coins   = new CoinManager();
    shop    = new Shop();
    Renderer.initStars();
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
    _nextWave();
  }

  function _nextWave() {
    wave += 1;
    wavePhase      = 'playing';
    wavePhaseTimer = 0;
    bullets.clear();
    coins.reset();
    enemies.spawnWave(wave);
  }

  /**
   * Main update — called every frame by main.js with delta time.
   * @param {number} dt  seconds since last frame
   */
  function update(dt) {
    Input.poll();

    // The starfield scrolls in every state so the loop is always visibly
    // alive — even on the menu and game-over screens.
    Renderer.updateStars(dt);

    switch (state) {
      case STATES.MENU:
        if (Input.confirmPressed()) startNewGame();
        break;

      case STATES.PLAYING:
        if (Input.pausePressed()) { state = STATES.PAUSED; break; }

        player.update(dt);
        if (player.wantsFire) bullets.spawnPlayer(player.gunX, player.gunY);
        bullets.update(dt);
        enemies.update(dt, { x: player.x, y: player.y }, bullets);
        _handleCollisions();
        coins.update(dt, player);

        if (wavePhase === 'playing' && enemies.allDefeated) {
          wavePhase      = 'clear';
          wavePhaseTimer = WAVE_CLEAR_DURATION;
        }
        if (wavePhase === 'clear') {
          wavePhaseTimer -= dt;
          if (wavePhaseTimer <= 0) _nextWave();
        }

        Renderer.updateParticles(dt);
        if (player.lives <= 0) _gameOver();
        break;

      case STATES.PAUSED:
        if (Input.pausePressed()) state = STATES.PLAYING;
        break;

      case STATES.SHOP:
        shop.update(coins, player);
        break;

      case STATES.GAMEOVER:
        if (Input.confirmPressed()) startNewGame();
        break;
    }
  }

  function draw(ctx) {
    // Solid black space background, then the parallax starfield over it.
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    Renderer.drawStars(ctx);

    switch (state) {
      case STATES.MENU:
        Renderer.drawStartScreen(ctx);
        break;

      case STATES.PLAYING:
      case STATES.PAUSED:
        enemies.draw(ctx);
        bullets.draw(ctx);
        player.draw(ctx);
        coins.draw(ctx);
        Renderer.drawParticles(ctx);
        Renderer.drawHUD(ctx, player, score, wave, coins);
        if (wavePhase === 'clear') {
          Renderer.drawWaveClear(ctx, wavePhaseTimer, WAVE_CLEAR_DURATION, wave);
        }
        if (state === STATES.PAUSED) Renderer.drawPauseScreen(ctx);
        break;

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
   *   1. player bullet → enemy   (enemy takes damage, dies if hp ≤ 0)
   *   2. enemy ship    → player  (player loses a life; kamikaze enemy destroyed)
   *   3. enemy bullet  → player  (player loses a life)
   * Removals use splice + pool recycle; the lists are small so cost is trivial.
   */
  function _handleCollisions() {
    const pb = bullets.playerBullets;
    const es = enemies.enemies;

    // 1 ── player bullets vs enemies ──────────────────────────────────────────
    for (let i = pb.length - 1; i >= 0; i--) {
      const b = pb[i];
      for (let j = 0; j < es.length; j++) {
        const e = es[j];
        if (e.y + e.h / 2 < 0) continue;       // still off the top of the screen
        if (!Utils.aabbCenter(b, e)) continue;

        const killed = e.hit(b.damage);
        bullets.recycle(b);
        pb.splice(i, 1);                        // bullet consumed by this hit
        if (killed) {
          score += e.score;
          coins.spawn(e.x, e.y, e.coinDrop);    // visible coins land in Step 7
          es.splice(j, 1);
        }
        break;                                  // bullet can only hit one enemy
      }
    }

    // 2 ── enemy ships vs player ───────────────────────────────────────────────
    if (player.vulnerable) {
      for (let j = es.length - 1; j >= 0; j--) {
        const e = es[j];
        if (e.y + e.h / 2 < 0) continue;
        if (!Utils.aabbCenter(e, player)) continue;
        if (player.hit()) es.splice(j, 1);      // only destroy it if it dealt damage
        break;
      }
    }

    // 3 ── enemy bullets vs player ─────────────────────────────────────────────
    const eb = bullets.enemyBullets;
    if (player.vulnerable) {
      for (let i = eb.length - 1; i >= 0; i--) {
        if (!Utils.aabbCenter(eb[i], player)) continue;
        bullets.recycle(eb[i]);
        eb.splice(i, 1);
        player.hit();
        break;
      }
    }
  }

  function _gameOver() {
    state = STATES.GAMEOVER;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('rss_highscore', highscore);
    }
  }

  // Debug accessor — exposes live references to internal entities for manual
  // console poking and automated tests. Harmless in normal play.
  function debug() {
    return {
      state, score, wave, wavePhase, player, bullets, enemies, coins,
      setLives: n => { player.lives = n; },
    };
  }

  return { init, startNewGame, update, draw, debug };
})();
