# Retro Space Shooter — Spec

## Gameplay

Vertikaler Scrolling-Shooter im Stil von Galaga/1942.  
Der Spieler steuert ein Raumschiff am unteren Bildschirmrand und schießt Wellen
feindlicher Schiffe ab, die in Formation einmarschieren und dann Sturzflug-Angriffe starten.
Jeder getötete Feind wirft Coins, die eingesammelt und zwischen den Wellen für
Waffen-Upgrades ausgegeben werden. Das Spiel hat keinen festen Endpunkt —
Wellen werden endlos schwerer, Ziel ist ein möglichst hoher Highscore.

---

## Steuerung

| Taste               | Aktion                          |
|---------------------|---------------------------------|
| WASD / Pfeiltasten  | Schiff bewegen (8 Richtungen)   |
| Leertaste / Z       | Schießen (halten = Dauerfeuer)  |
| P / ESC             | Pause / Fortsetzen              |
| Enter               | Bestätigen (Menü, Shop-Kauf)    |
| ↑/↓ W/S (Shop)      | Upgrade auswählen               |
| P / ESC (Shop)      | Shop überspringen → nächste Welle|

---

## Features

### Spieler
- Bewegung in 8 Richtungen, Wandbegrenzung
- 3 Leben; 2 s Unverwundbarkeitsphase nach Treffer (blinkende Animation)
- Schuss-Cooldown abhängig vom Rapid-Fire-Upgrade
- **Schildaura** sichtbar während Shield-Power-up aktiv

### Feinde
- **3 Typen:** A (rot, 1 HP, 100 Pkt), B (orange, 2 HP, 200 Pkt), C (lila, 3 HP, 400 Pkt)
- Formation: 4–6 Reihen × 8 Spalten (wächst alle 2 Wellen), gemischte Typen
- Einmarsch-Animation mit Ease-in-out-Cubic
- Horizontale Schwingung der gesamten Formation (±90 px)
- Sturzflug-KI: 1–3 Feinde gleichzeitig stürzen ab (Anzahl steigt mit Welle),
  folgen einer Quadratischen-Bézier-Kurve zum Spieler, schießen dabei
- Feinde schießen auch in Formation sporadisch

### Boss (alle 5 Wellen)
- Großer Flaggschiff-Sprite (80 × 60 px auf Screen)
- HP: 50 + (Boss-Nr − 1) × 30
- **Phase 1:** 3-Wege-Spread in Spieler-Richtung, horizontales Sweep
- **Phase 2 (< 50 % HP):** Extra Diagonalschüsse, HP-Balken färbt sich rot
- Boss-HP-Balken am unteren Bildschirmrand
- Drops immer ein Power-up beim Tod

### Coins & Shop
- Coin-Drop pro Feind: A = 1, B = 2, C = 4
- Magnet-Pull innerhalb 80 px vom Spieler
- Fade-Out nach 8 Sekunden
- Nach jeder Welle: Shop-Overlay (P zum Überspringen)

| Upgrade        | Effekt                                         | Kosten | Max |
|----------------|------------------------------------------------|--------|-----|
| Rapid Fire     | −30 % Schuss-Cooldown pro Stufe                | 10     | 3   |
| Spread Shot    | 3-Wege-Schuss (±15°)                           | 20     | 3   |
| Double Cannon  | Zweite Kanone (+8 px seitlich)                 | 15     | 1   |
| Power Laser    | Schaden × 2 pro Schuss                         | 40     | 1   |

### Power-ups (Gelegenheitsdrop, 10 % Chance)
| Typ    | Symbol | Effekt              | Dauer |
|--------|--------|---------------------|-------|
| Shield | S      | Treffer-Immunität   | 6 s   |
| Spread | W      | 3-Wege-Schuss       | 12 s  |

### Sound (Web Audio API, keine externen Files)
- Schuss-Piep (Spieler)
- Explosions-Noise (klein / groß für Boss)
- Spieler-Treffer-Tiefton
- Wellen-klar-Fanfare (aufsteigende Noten)
- Coin-Tick, Power-up-Jingle, Boss-Hit-Klick

### Visuelles
- Prozedurale Sprites via Canvas `fillRect`
- Scrollendes Parallax-Starfield (3 Ebenen)
- Explosionspartikel beim Feindtod (14 Partikel normal, 28 für Boss)
- Screen-Shake bei Spielertreffer
- Mündungsblitz beim Abfeuern
- Shield-Aura um das Spielerschiff

---

## Technische Architektur

```
game/
├── index.html          ← Canvas + Script-Tags (kein Build-Tool)
├── style.css           ← Fullscreen Canvas 16:9
├── SPEC.md             ← dieses Dokument
├── README.md           ← Kurzanleitung
└── js/
    ├── config.js       ← Alle Konstanten (Speeds, Farben, Upgrade-Daten)
    ├── utils.js        ← AABB, Bézier, lerp, clamp, randFloat …
    ├── input.js        ← Tastatur-State (held / pressed-Edge pro Frame)
    ├── audio.js        ← Prozedurale Sounds via Web Audio API
    ├── player.js       ← Player-Klasse (Bewegung, Schuss, Power-ups)
    ├── bullets.js      ← BulletManager + Objekt-Pool
    ├── enemies.js      ← Enemy + EnemyManager (Formation, Dive-KI, Schüsse)
    ├── boss.js         ← Boss + BossManager (HP, Phasen, Angriffsmuster)
    ├── coins.js        ← CoinManager (Drop, Drift, Magnet, Pickup)
    ├── powerups.js     ← PowerupManager (Drop, Pickup, Draw)
    ├── shop.js         ← Shop (UI, Kauflogik)
    ├── renderer.js     ← Starfield, HUD, Screens, Partikel, Boss-HP-Bar
    ├── game.js         ← State-Machine (menu|playing|paused|shop|gameover)
    └── main.js         ← Entry Point, Fixed-Timestep RAF-Loop
```

**Keine ES-Module** — klassische Script-Tags, globaler Namespace.  
Funktioniert mit `file://` ohne lokalen Server.

---

## Schwierigkeits-Kurve

| Welle | Reihen | Gleichzeitige Diver | Boss |
|-------|--------|---------------------|------|
| 1     | 4      | 1                   | –    |
| 2     | 4      | 1                   | –    |
| 3     | 5      | 1                   | –    |
| 4     | 5      | 2                   | –    |
| 5     | –      | –                   | ✓ (50 HP) |
| 6     | 6      | 2                   | –    |
| 7     | 6      | 3                   | –    |
| 10    | –      | –                   | ✓ (80 HP) |
| …     | 6 max  | 3 max               | ±5   |

Formationsgeschwindigkeit: +6 px/s je Welle.  
Dive-Intervall: −8 % je Welle (Minimum 0.6 s).  
Dive-Dauer: −0.12 s je Welle (Minimum 1.0 s).
