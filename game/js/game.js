// Central game state machine.
// States: 'start' | 'playing' | 'paused' | 'shop' | 'gameover'
const Game = (() => {
  let state    = STATES.MENU;
  let score    = 0;
  let highscore = 0;
  let wave     = 0;

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
    state  = STATES.PLAYING;
    score  = 0;
    wave   = 0;
    player.reset();
    bullets.clear();
    coins.reset();
    coins.total = 0;
    _nextWave();
  }

  function _nextWave() {
    wave += 1;
    enemies.spawnWave(wave);
    // TODO (Step 9): increase difficulty via CONFIG.WAVE.DIFFICULTY_INCREMENT
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
        // TODO (Steps 3–9): update player, bullets, enemies, coins; check
        //                   collisions; detect wave clear → shop; detect
        //                   game over
        Renderer.updateParticles(dt);
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

  function _gameOver() {
    state = STATES.GAMEOVER;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('rss_highscore', highscore);
    }
  }

  return { init, startNewGame, update, draw };
})();
