// Procedural sound effects via Web Audio API — no external files.
// AudioContext is created lazily on first user interaction to satisfy the
// browser autoplay policy. All methods are safe to call before that point.
const Audio = (() => {
  let _ctx = null;

  function init() {
    if (_ctx) return;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* browser may block — degrade silently */ }
  }

  function _resume() {
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
  }

  function _osc(type, startFreq, endFreq, gainPeak, duration) {
    if (!_ctx) return;
    const osc  = _ctx.createOscillator();
    const gain = _ctx.createGain();
    const t    = _ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, t);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t + duration);
    }
    gain.gain.setValueAtTime(gainPeak, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(_ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  function _noise(durationSec, filterFreq, gainPeak) {
    if (!_ctx) return;
    const sampleRate = _ctx.sampleRate;
    const buf  = _ctx.createBuffer(1, sampleRate * durationSec, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src    = _ctx.createBufferSource();
    const filter = _ctx.createBiquadFilter();
    const gain   = _ctx.createGain();
    const t      = _ctx.currentTime;
    filter.type            = 'lowpass';
    filter.frequency.value = filterFreq;
    gain.gain.setValueAtTime(gainPeak, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durationSec);
    src.buffer = buf;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(_ctx.destination);
    src.start(t);
    src.stop(t + durationSec);
  }

  function shoot() {
    if (!_ctx) return;
    _resume();
    _osc('square', 900, 300, 0.12, 0.09);
  }

  function explosion(big = false) {
    if (!_ctx) return;
    _resume();
    _noise(big ? 0.8 : 0.28, big ? 900 : 400, big ? 0.5 : 0.28);
    if (big) _osc('sawtooth', 120, 40, 0.3, 0.6);
  }

  function playerHit() {
    if (!_ctx) return;
    _resume();
    _osc('sawtooth', 220, 60, 0.35, 0.35);
    _noise(0.2, 600, 0.15);
  }

  function waveClear() {
    if (!_ctx) return;
    _resume();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const t = _ctx.currentTime + i * 0.13;
      const osc  = _ctx.createOscillator();
      const gain = _ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(_ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  function coinPickup() {
    if (!_ctx) return;
    _resume();
    _osc('sine', 1100 + Math.random() * 500, 1400 + Math.random() * 300, 0.1, 0.06);
  }

  function powerupPickup() {
    if (!_ctx) return;
    _resume();
    [660, 880, 1100, 1320].forEach((freq, i) => {
      const t = _ctx.currentTime + i * 0.07;
      const osc  = _ctx.createOscillator();
      const gain = _ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(_ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }

  function bossHit() {
    if (!_ctx) return;
    _resume();
    _osc('square', 180, 90, 0.2, 0.12);
  }

  return { init, shoot, explosion, playerHit, waveClear, coinPickup, powerupPickup, bossHit };
})();
