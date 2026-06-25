// Keys the game owns — preventDefault only these so the browser keeps the rest.
const GAME_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyZ',
  'Space', 'Enter', 'KeyP', 'Escape',
]);

// Keyboard state tracker. Modules read held state and edge-triggered presses.
const Input = (() => {
  const held = {};            // true while a key is physically down
  let pressBuffer = new Set(); // fresh presses since last poll()
  let pressed     = new Set(); // presses exposed for the current frame

  function init() {
    window.addEventListener('keydown', e => {
      // Buffer the *edge* (first keydown), ignoring OS auto-repeat. Buffering
      // here — rather than diffing held-state in poll() — means a tap shorter
      // than a frame is still registered exactly once.
      if (!held[e.code] && !e.repeat) pressBuffer.add(e.code);
      held[e.code] = true;
      // Don't swallow keys the page doesn't use (e.g. devtools, F-keys).
      if (GAME_KEYS.has(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      held[e.code] = false;
    });
    // Release everything if focus is lost, so keys don't get stuck "held".
    window.addEventListener('blur', () => {
      for (const k in held) held[k] = false;
    });
  }

  /** Promote buffered presses to this frame and reset the buffer. */
  function poll() {
    pressed = pressBuffer;
    pressBuffer = new Set();
  }

  function isHeld(code)    { return !!held[code]; }
  function isPressed(code) { return pressed.has(code); }

  // Movement direction as a normalized-ish vector (diagonals scaled).
  function moveVector() {
    let dx = 0, dy = 0;
    if (isHeld('ArrowLeft')  || isHeld('KeyA')) dx -= 1;
    if (isHeld('ArrowRight') || isHeld('KeyD')) dx += 1;
    if (isHeld('ArrowUp')    || isHeld('KeyW')) dy -= 1;
    if (isHeld('ArrowDown')  || isHeld('KeyS')) dy += 1;
    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv; dy *= inv;
    }
    return { dx, dy };
  }

  function shooting()       { return isHeld('Space') || isHeld('KeyZ'); }
  function pausePressed()   { return isPressed('KeyP') || isPressed('Escape'); }
  function confirmPressed() { return isPressed('Enter') || isPressed('Space'); }

  return { init, poll, isHeld, isPressed, moveVector, shooting, pausePressed, confirmPressed };
})();
