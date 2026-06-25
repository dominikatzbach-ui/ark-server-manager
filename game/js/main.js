// Entry point — wires up canvas, starts game loop.
(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  Input.init();
  Game.init();

  let lastTime = 0;

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50 ms
    lastTime = timestamp;

    Game.update(dt);
    Game.draw(ctx);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(ts => {
    lastTime = ts;
    requestAnimationFrame(loop);
  });
})();
