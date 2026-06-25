// Keyboard state tracker. Modules read Input.held / Input.pressed.
const Input = (() => {
  const held    = {};   // key held down this frame
  const pressed = {};   // key pressed this frame (single-frame true)
  const _prev   = {};   // held state from previous frame

  function init() {
    window.addEventListener('keydown', e => {
      held[e.code] = true;
      e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      held[e.code] = false;
    });
  }

  /** Call once per frame before update() to compute single-frame pressed state */
  function poll() {
    for (const code in held) {
      pressed[code] = held[code] && !_prev[code];
      _prev[code]   = held[code];
    }
  }

  function isHeld(code)    { return !!held[code]; }
  function isPressed(code) { return !!pressed[code]; }

  // Convenience: movement direction as a normalized-ish vector
  function moveVector() {
    let dx = 0, dy = 0;
    if (isHeld('ArrowLeft')  || isHeld('KeyA')) dx -= 1;
    if (isHeld('ArrowRight') || isHeld('KeyD')) dx += 1;
    if (isHeld('ArrowUp')    || isHeld('KeyW')) dy -= 1;
    if (isHeld('ArrowDown')  || isHeld('KeyS')) dy += 1;
    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv; dy *= inv;
    }
    return { dx, dy };
  }

  function shooting() { return isHeld('Space') || isHeld('KeyZ'); }
  function pausePressed() { return isPressed('KeyP') || isPressed('Escape'); }
  function confirmPressed() { return isPressed('Enter') || isPressed('Space'); }

  return { init, poll, isHeld, isPressed, moveVector, shooting, pausePressed, confirmPressed };
})();
