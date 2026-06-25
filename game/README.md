# Retro Space Shooter

Ein Galaga/1942-Klon in reinem HTML5 Canvas + Vanilla JS.  
Keine Build-Tools, keine externen Abhängigkeiten — einfach `game/index.html` im Browser öffnen.

## Spielen

```
Datei öffnen: game/index.html
```

Oder mit lokalem Server (für CORS-sicheres Testen):

```bash
python3 -m http.server 8080 --directory game
# → http://localhost:8080
```

## Steuerung

| Taste           | Aktion                   |
|-----------------|--------------------------|
| WASD / ←↑↓→    | Schiff bewegen           |
| Leertaste / Z   | Schießen (Dauerfeuer)    |
| P / Escape      | Pause / Shop überspringen|
| Enter           | Bestätigen               |
| ↑/↓ im Shop     | Upgrade auswählen        |

## Features

- **3 Gegnertypen** in Formation (rot/orange/lila), Sturzflug-KI, Eigen-Schüsse
- **Boss alle 5 Wellen** mit 2-Phasen-Angriff und HP-Balken
- **4 Waffen-Upgrades** im Shop (Rapid Fire, Spread Shot, Double Cannon, Power Laser)
- **2 Power-ups** (Schild 6 s, Dreifachschuss 12 s) — fallen gelegentlich von Gegnern
- **Prozeduraler Sound** via Web Audio API
- **Partikel-Explosionen**, Screen-Shake, Mündungsblitz
- **Highscore** in `localStorage`

## Datei-Übersicht

```
game/
├── index.html       Einstiegspunkt
├── style.css        Vollbild-Canvas 16:9
├── SPEC.md          Vollständige Spielspezifikation
└── js/
    ├── config.js    Alle Spielkonstanten
    ├── audio.js     Web Audio Soundeffekte
    ├── player.js    Spielerschiff
    ├── bullets.js   Projektil-Pool
    ├── enemies.js   Gegner-KI und Formation
    ├── boss.js      Boss-Gegner
    ├── coins.js     Coin-Drop und Magnet
    ├── powerups.js  Power-up-Drops
    ├── shop.js      Upgrade-Shop
    ├── renderer.js  HUD, Screens, Partikel
    ├── game.js      Spiel-State-Machine
    └── main.js      Game-Loop
```
