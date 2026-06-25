// Static drawing utilities — starfield background, HUD, screens.
// Entity drawing lives in each entity's own draw() method.
const Renderer = (() => {
  // Starfield state — array of {x, y, speed, brightness}
  let stars = [];

  function initStars(count = 120) {
    // TODO (Step 10): populate stars randomly across canvas
  }

  /** Scroll stars and wrap at bottom — call once per frame */
  function updateStars(dt) {
    // TODO (Step 10): move each star downward by star.speed * dt, wrap to top
  }

  function drawStars(ctx) {
    // TODO (Step 10): draw each star as a white pixel/small rect
  }

  /** HUD: lives, score, wave, coin count */
  function drawHUD(ctx, player, score, wave, coins) {
    // TODO (Step 9): draw text overlays
  }

  /** Full-screen title / start screen */
  function drawStartScreen(ctx) {
    // TODO (Step 10): retro title text, "PRESS ENTER" blink
  }

  /** Game over screen with score and highscore */
  function drawGameOverScreen(ctx, score, highscore) {
    // TODO (Step 10): GAME OVER text, scores, restart prompt
  }

  /** Pause overlay */
  function drawPauseScreen(ctx) {
    // TODO (Step 10): semi-transparent overlay with PAUSED text
  }

  /** Simple explosion particles — stored here as they're purely visual */
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
    drawHUD, drawStartScreen, drawGameOverScreen, drawPauseScreen,
    spawnExplosion, updateParticles, drawParticles,
  };
})();
