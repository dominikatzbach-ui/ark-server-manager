# ARK:SA Server Manager

Cross-platform tool to install, configure and manage ARK: Survival Ascended dedicated servers. Supports **Linux (via Wine/Proton)** and **Windows** natively.

> **Sprache / Language:** [Deutsch](#deutsche-anleitung) | [English](#english-guide)

---

## Deutsche Anleitung

### Was ist das?

Der ARK:SA Server Manager ist ein Web-Tool, das dir hilft, einen ARK: Survival Ascended Dedicated Server zu installieren, zu konfigurieren und zu betreiben — ohne Kommandozeilen-Kenntnisse. Du baust einmal die Anwendung, startest sie, und alles Weitere läuft über den Browser.

### Voraussetzungen

**Linux:**
- Go 1.22 oder neuer → https://go.dev/dl/
- Node.js 20 oder neuer → https://nodejs.org/
- Wine oder Proton (für ARK:SA unter Linux, da der Gameserver nur als Windows-Binary existiert)
  - Ubuntu/Debian: `sudo apt install wine`
  - Alternativ: Steam mit Proton installieren
- SteamCMD (wird automatisch heruntergeladen, wenn noch nicht vorhanden)
- Mindestens 20 GB freier Speicherplatz für die Serverdateien
- Empfohlen: 8 GB RAM, 4 CPU-Kerne

**Windows:**
- Go 1.22 oder neuer → https://go.dev/dl/
- Node.js 20 oder neuer → https://nodejs.org/
- SteamCMD (wird automatisch heruntergeladen)
- Mindestens 20 GB freier Speicherplatz
- Empfohlen: 8 GB RAM, 4 CPU-Kerne

### Installation & Build

```bash
# 1. Repository klonen
git clone https://github.com/dominikatzbach-ui/ark-server-manager.git
cd ark-server-manager

# 2. Frontend-Abhängigkeiten installieren
make setup

# 3. Anwendung bauen (Frontend wird ins Binary eingebettet)
make build
```

Das fertige Binary liegt danach unter:
- Linux: `dist/ark-server-manager`
- Windows (Cross-Compile): `dist/ark-server-manager.exe`

### Server starten

```bash
# Linux
./dist/ark-server-manager

# Windows
dist\ark-server-manager.exe

# Optional: Port ändern (Standard ist 8080)
PORT=9090 ./dist/ark-server-manager
```

Browser öffnen: **http://localhost:8080**

### ARK:SA Server einrichten (Schritt für Schritt)

1. **Manager starten** — Binary ausführen, Browser öffnen
2. **Neuen Server anlegen** — im Web-UI auf „Neuer Server" klicken
3. **SteamCMD-Pfad angeben** — oder automatisch herunterladen lassen
4. **Server installieren** — der Manager lädt die ARK:SA Serverdateien via SteamCMD herunter (~15 GB)
5. **Karte und Port konfigurieren** — z.B. Map: `TheIsland`, Query-Port: `27015`, Game-Port: `7777`
6. **Server starten** — ein Klick, der Manager überwacht den Prozess
7. **Logs einsehen** — Live-Logs direkt im Browser unter dem Tab „Logs"
8. **INI-Konfiguration bearbeiten** — `Game.ini` und `GameUserSettings.ini` direkt im Browser editieren

### Wichtige Ports (Firewall freigeben)

| Port  | Protokoll | Zweck                        |
|-------|-----------|------------------------------|
| 7777  | UDP       | Spielverbindung              |
| 7778  | UDP       | Raw UDP Socket               |
| 27015 | UDP       | Steam Query (Serverliste)    |
| 8080  | TCP       | Web-UI (nur lokal nötig)     |

### Häufige Probleme

**Linux: Server startet nicht**
→ Wine/Proton installiert? `wine --version` prüfen

**Port belegt**
→ `PORT=9090 ./dist/ark-server-manager` für anderen Web-UI-Port

**SteamCMD Download schlägt fehl**
→ Internet-Verbindung prüfen, ggf. SteamCMD manuell installieren

---

## English Guide

### What is this?

ARK:SA Server Manager is a web-based tool to install, configure and run an ARK: Survival Ascended dedicated server — no command-line skills required. Build it once, run it, manage everything from your browser.

### Prerequisites

**Linux:**
- Go 1.22+ → https://go.dev/dl/
- Node.js 20+ → https://nodejs.org/
- Wine or Proton (required for ARK:SA on Linux, as the game server is Windows-only)
  - Ubuntu/Debian: `sudo apt install wine`
  - Or: install Steam with Proton
- SteamCMD (auto-downloaded if not present)
- At least 20 GB free disk space for server files
- Recommended: 8 GB RAM, 4 CPU cores

**Windows:**
- Go 1.22+ → https://go.dev/dl/
- Node.js 20+ → https://nodejs.org/
- SteamCMD (auto-downloaded)
- At least 20 GB free disk space
- Recommended: 8 GB RAM, 4 CPU cores

### Installation & Build

```bash
# 1. Clone the repository
git clone https://github.com/dominikatzbach-ui/ark-server-manager.git
cd ark-server-manager

# 2. Install frontend dependencies
make setup

# 3. Build the application (frontend is embedded into the binary)
make build
```

The resulting binary is located at:
- Linux: `dist/ark-server-manager`
- Windows (cross-compile): `dist/ark-server-manager.exe`

### Running

```bash
# Linux
./dist/ark-server-manager

# Windows
dist\ark-server-manager.exe

# Optional: change port (default is 8080)
PORT=9090 ./dist/ark-server-manager
```

Open your browser at **http://localhost:8080**

### Setting up an ARK:SA Server (step by step)

1. **Start the manager** — run the binary, open your browser
2. **Create a new server** — click "New Server" in the web UI
3. **Set SteamCMD path** — or let the manager download it automatically
4. **Install the server** — the manager downloads ARK:SA server files via SteamCMD (~15 GB)
5. **Configure map and ports** — e.g. Map: `TheIsland`, Query Port: `27015`, Game Port: `7777`
6. **Start the server** — one click, the manager monitors the process
7. **View logs** — live log output directly in the browser under the "Logs" tab
8. **Edit INI configuration** — edit `Game.ini` and `GameUserSettings.ini` directly in the browser

### Required Ports (open in firewall)

| Port  | Protocol | Purpose                      |
|-------|----------|------------------------------|
| 7777  | UDP      | Game connection              |
| 7778  | UDP      | Raw UDP socket               |
| 27015 | UDP      | Steam query (server browser) |
| 8080  | TCP      | Web UI (local only)          |

### Troubleshooting

**Linux: server won't start**
→ Is Wine/Proton installed? Run `wine --version` to check

**Port already in use**
→ Use `PORT=9090 ./dist/ark-server-manager` for a different web UI port

**SteamCMD download fails**
→ Check internet connectivity, or install SteamCMD manually

---

## Architecture

| Component | Technology |
|-----------|-----------|
| Backend   | Go (single binary, REST API) |
| Frontend  | React + Vite + TypeScript |
| Embedding | Go `embed.FS` — frontend bundled into binary |
| Linux ASA | Wine/Proton (automated) |

## CI/CD

GitHub Actions pipelines for:
- **CI**: Build + test on every push/PR
- **Release**: Cross-compiled binaries attached to GitHub Releases

## License

MIT — see [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
