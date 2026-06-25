// Entry point — wires up canvas and runs a fixed-timestep game loop.
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  Input.init();
  Game.init();

  const FIXED_DT  = CONFIG.FIXED_DT;   // simulation step in seconds (1/60)
  const MAX_FRAME = 0.25;              // clamp to avoid the "spiral of death"

  let lastTime    = performance.now();
  let accumulator = 0;

  // Fixed-timestep loop: render as fast as the display allows, but step the
  // simulation in deterministic FIXED_DT chunks. A long frame (tab in
  // background, slow device) is clamped so we never try to catch up forever.
  function loop(now) {
    let frameTime = (now - lastTime) / 1000;
    lastTime = now;
    if (frameTime > MAX_FRAME) frameTime = MAX_FRAME;

    accumulator += frameTime;
    while (accumulator >= FIXED_DT) {
      Game.update(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    Game.draw(ctx);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
