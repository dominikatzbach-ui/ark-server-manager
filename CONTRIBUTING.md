# Contributing to ARK:SA Server Manager

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/dominikatzbach-ui/ark-server-manager`
3. Create a feature branch: `git checkout -b feature/your-feature`

## Development Setup

### Prerequisites
- Go 1.22+
- Node.js 20+
- Make

### Build

```bash
# Install frontend dependencies
make setup

# Start development servers (Go + Vite with hot reload)
make dev

# Build production binary
make build
```

## Code Style

### Go
- Run `gofmt` before committing
- Follow standard Go project layout conventions
- Write tests for new functionality

### TypeScript / React
- ESLint + Prettier (config included)
- Functional components with hooks
- No `any` types without justification

## Pull Request Process

1. Ensure `make build` succeeds
2. Ensure `make test` passes
3. Update README if you change behavior
4. Link the related issue in your PR description

## Reporting Issues

- Use the GitHub issue tracker
- Include your OS, Go version, and steps to reproduce
- For Wine/Proton issues: include your Wine/Proton version and distro

## License

By contributing, you agree your contributions are licensed under the MIT License.
