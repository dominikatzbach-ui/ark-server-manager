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

| Taste               | Aktion                         |
|---------------------|-------------------------------|
| WASD / Pfeiltasten  | Schiff bewegen (8 Richtungen) |
| Leertaste / Z       | Schießen (halten = Dauerfeuer)|
| P / ESC             | Pause / Fortsetzen            |
| Enter               | Bestätigen (Menü, Shop)       |
| Pfeiltasten (Shop)  | Upgrade auswählen             |

---

## Features

### Spieler
- Bewegung in 8 Richtungen, Wandbegrenzung links/rechts/oben/unten
- 3 Leben; kurze Unverwundbarkeitsphase nach Treffer (blinkende Animation)
- Schuss-Cooldown abhängig vom Rapid-Fire-Upgrade

### Feinde
- **3 Typen:** A (rot, 1 HP), B (orange, 2 HP), C (lila, 3 HP)
- Formation: 4 Reihen × 8 Spalten, gemischte Typen je Welle
- Einmarsch-Animation: Feinde fliegen von oben in ihre Formationsslots
- Leichte horizontale Schwingung in Formation
- Sturzflug-KI: alle N Sekunden löst sich 1–2 Feinde aus Formation,
  folgt einer Quadratischen-Bézier-Kurve in Richtung Spieler und
  schießt dabei; nach Durchquerung des Bildschirms kehrt er zurück oder
  gilt als verloren
- Eigene Schüsse: Feinde in der vordersten Reihe schießen sporadisch

### Coins & Shop
- Jeder getötete Feind droppt 1–4 Coins (je nach Typ), die nach unten fallen
- Coins werden automatisch zum Spieler hin magnetisch angezogen, wenn nah genug
- Nicht eingesammelte Coins verschwinden nach 8 Sekunden
- Nach jeder Welle öffnet sich der **Shop** (Spielpause):

| Upgrade        | Effekt                                        | Kosten | Max |
|----------------|-----------------------------------------------|--------|-----|
| Rapid Fire     | −30 % Schuss-Cooldown pro Stufe               | 10     | 3   |
| Spread Shot    | +1 zusätzlicher Schuss pro Stufe (Winkel ±15°)| 20     | 3   |
| Double Cannon  | Zweite Kanone neben dem Hauptschuss            | 15     | 1   |
| Power Laser    | Ersetzt Einzelschuss durch Dauerstrahl (+2 DMG)| 40    | 1   |

- Nicht ausgegebene Coins bleiben erhalten

### Score & Highscore
- Punkte pro getötetem Feind: A = 100, B = 200, C = 400
- Bonus bei Sturzflug-Kill: ×2 Punkte
- Highscore wird in `localStorage` gespeichert

### Visuelles
- Prozedural gezeichnete Sprites (Canvas 2D Primitives — keine Bild-Assets)
- Scrollendes Starfield (3 Ebenen verschiedener Geschwindigkeit = Parallax)
- Explosions-Partikel beim Feindtod
- Blinken-Effekt wenn Spieler getroffen wird

---

## Technische Architektur

```
game/
├── index.html          ← Canvas + Script-Tags (kein Build-Tool)
├── style.css           ← Fullscreen Canvas, pixelated rendering
├── SPEC.md             ← dieses Dokument
└── js/
    ├── config.js       ← Alle Konstanten (Speeds, Farben, Upgrade-Daten)
    ├── utils.js        ← AABB, Bézier, lerp, clamp, randFloat …
    ├── input.js        ← Tastatur-State (held / pressed pro Frame)
    ├── player.js       ← Player-Klasse (Bewegung, Schuss, Upgrades)
    ├── bullets.js      ← BulletManager (Spieler- & Feindschüsse)
    ├── enemies.js      ← Enemy + EnemyManager (Formation, Dive-KI)
    ├── coins.js        ← CoinManager (Drop, Magnet, Pickup)
    ├── shop.js         ← Shop (UI, Kauflogik)
    ├── renderer.js     ← Starfield, HUD, Screens, Explosionspartikel
    ├── game.js         ← State-Machine (start|playing|paused|shop|gameover)
    └── main.js         ← Entry Point, requestAnimationFrame-Loop
```

**Keine ES-Module** — klassische Script-Tags in definierter Load-Reihenfolge,
gemeinsamer globaler Namespace. Funktioniert mit `file://` ohne Server.

---

## 10-Schritt-Umsetzungsplan

| # | Schritt | Ziel / Deliverable |
|---|---------|-------------------|
| 1 | **Struktur & Spec** | Alle Dateien angelegt, SPEC.md, leerer Canvas sichtbar im Browser |
| 2 | **Game Loop + Input** | RAF-Loop läuft mit deltaTime-Cap; Tasten-State korrekt per Frame |
| 3 | **Spieler-Schiff** | Schiff bewegt sich im Canvas, feuert einzelne Bullets, Kollisionsbox |
| 4 | **Bullet-System** | Player- & Enemy-Bullets bewegen sich, Screen-Culling, Dauerfeuer |
| 5 | **Feind-Formation** | Welle spawnt, Feinde fliegen in Formation ein, Schwingung, draw |
| 6 | **Dive-Angriff-KI** | Feinde lösen sich, Bézier-Kurve zum Spieler, schießen im Dive |
| 7 | **Kollision & Coins** | Hit-Detection Bullet↔Enemy, Enemy↔Player; Coin-Drop, Magnet, Pickup |
| 8 | **Shop & Upgrades** | Coin-Zähler im HUD; Shop-Overlay nach Welle; alle 4 Upgrades wirken |
| 9 | **Endlos & Score** | Wellen-Generator, Schwierigkeits-Scaling, Score, Lives, Game Over |
| 10 | **Polish** | Starfield, Explosionen, Start-Screen, Game-Over-Screen, Balancing |

Jeder Schritt ist einzeln spielbar und testbar — kein Schritt bricht einen vorherigen.
