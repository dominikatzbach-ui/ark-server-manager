// Central game state machine.
// States: 'start' | 'playing' | 'paused' | 'shop' | 'gameover'
const Game = (() => {
  let state    = 'start';
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
    state  = 'playing';
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

    switch (state) {
      case 'start':
        // TODO (Step 10): wait for ENTER
        break;

      case 'playing':
        // TODO (Steps 3–9): update player, bullets, enemies, coins; check
        //                   collisions; detect wave clear → shop; detect
        //                   game over
        Renderer.updateStars(dt);
        Renderer.updateParticles(dt);
        break;

      case 'paused':
        // TODO (Step 10): resume on P/ESC
        break;

      case 'shop':
        shop.update(coins, player);
        break;

      case 'gameover':
        // TODO (Step 9): save highscore, wait for ENTER to restart
        break;
    }
  }

  function draw(ctx) {
    ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    Renderer.drawStars(ctx);

    switch (state) {
      case 'start':
        Renderer.drawStartScreen(ctx);
        break;

      case 'playing':
      case 'paused':
        enemies.draw(ctx);
        bullets.draw(ctx);
        player.draw(ctx);
        coins.draw(ctx);
        Renderer.drawParticles(ctx);
        Renderer.drawHUD(ctx, player, score, wave, coins);
        if (state === 'paused') Renderer.drawPauseScreen(ctx);
        break;

      case 'shop':
        enemies.draw(ctx);
        player.draw(ctx);
        Renderer.drawHUD(ctx, player, score, wave, coins);
        shop.draw(ctx, coins, player);
        break;

      case 'gameover':
        Renderer.drawGameOverScreen(ctx, score, highscore);
        break;
    }
  }

  function _gameOver() {
    state = 'gameover';
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('rss_highscore', highscore);
    }
  }

  return { init, startNewGame, update, draw };
})();
