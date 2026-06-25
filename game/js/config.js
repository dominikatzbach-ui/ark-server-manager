// Central constants — change values here, everything else adapts.
const CONFIG = Object.freeze({
  CANVAS: { WIDTH: 480, HEIGHT: 720 },

  PLAYER: {
    SPEED: 220,         // px/s
    LIVES: 3,
    INVINCIBLE_MS: 2000,
    GUN_COOLDOWN_MS: 250,
  },

  BULLET: {
    PLAYER_SPEED: 500,  // px/s upward
    ENEMY_SPEED: 200,
  },

  ENEMY: {
    FORMATION_ROWS: 4,
    FORMATION_COLS: 8,
    CELL_W: 48,
    CELL_H: 40,
    OFFSET_X: 24,
    OFFSET_Y: 60,
    DIVE_SPEED: 260,
    DIVE_INTERVAL_MS: 3000, // time between dive triggers
  },

  COIN: {
    SPEED: 80,          // px/s downward
    LIFETIME_MS: 8000,
    MAGNET_RANGE: 80,   // px — coin attracted to player within this range
    MAGNET_SPEED: 300,
  },

  WAVE: {
    DIFFICULTY_INCREMENT: 0.12, // multiplier added per wave
  },

  SHOP: {
    UPGRADES: [
      { id: 'rapid_fire',    label: 'Rapid Fire',    cost: 10, maxLevel: 3 },
      { id: 'spread_shot',   label: 'Spread Shot',   cost: 20, maxLevel: 3 },
      { id: 'double_cannon', label: 'Double Cannon', cost: 15, maxLevel: 1 },
      { id: 'power_laser',   label: 'Power Laser',   cost: 40, maxLevel: 1 },
    ],
  },

  COLORS: {
    PLAYER:      '#00e5ff',
    PLAYER_GUN:  '#ffffff',
    ENEMY_A:     '#ff4444',
    ENEMY_B:     '#ff9900',
    ENEMY_C:     '#cc44ff',
    BULLET_PLAYER: '#00ff88',
    BULLET_ENEMY:  '#ff3300',
    COIN:        '#ffd700',
    STAR:        '#ffffff',
    HUD:         '#ffffff',
    SCORE:       '#ffd700',
  },
});
