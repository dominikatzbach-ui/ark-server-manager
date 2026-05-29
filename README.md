# ARK:SA Server Manager

Cross-platform tool to install, configure and manage ARK: Survival Ascended dedicated servers. Supports **Linux (via Wine/Proton)** and **Windows** natively.

## Features

- Automated SteamCMD download and server installation
- Wine/Proton automation for ASA on Linux
- Web-UI for server management (start/stop/monitor/logs)
- Configuration editor (INI, CLI args, maps, ports)
- Cross-platform: single binary for Linux and Windows

## Architecture

| Component | Technology |
|-----------|-----------|
| Backend   | Go (single binary, REST API) |
| Frontend  | React + Vite + TypeScript |
| Embedding | Go `embed.FS` — frontend bundled into binary |
| Linux ASA | Wine/Proton (automated) |

## Quick Start

### Prerequisites
- Linux: Go 1.22+, Node.js 20+, Wine/Proton (for ASA)
- Windows: Go 1.22+, Node.js 20+

### Build

```bash
# Build for current platform
make build

# Build for both Windows and Linux
make build-all

# Development mode (hot reload)
make dev
```

The binary is placed in `dist/`:
- `dist/ark-server-manager` (Linux)
- `dist/ark-server-manager.exe` (Windows)

### Run

```bash
./dist/ark-server-manager
# Open http://localhost:8080 in your browser
```

## CI/CD

GitHub Actions pipelines for:
- **CI**: Build + test on every push/PR
- **Release**: Cross-compiled binaries attached to GitHub Releases

## License

MIT — see [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
