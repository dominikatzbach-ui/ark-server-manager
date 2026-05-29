#!/usr/bin/env bash
# setup-wine.sh — Installs Wine (GloriousEggroll build or Debian/Ubuntu packages)
# plus winetricks and Xvfb on Debian 11/12 / Ubuntu 22.04+.
# Idempotent: safe to re-run.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_PREFIX="[setup-wine]"

# ---- GE-Wine release to target (pinned for reproducibility) ----
GE_WINE_VERSION="${GE_WINE_VERSION:-GE-Proton9-27}"
GE_WINE_URL="https://github.com/GloriousEggroll/wine-ge-custom/releases/download/${GE_WINE_VERSION}/${GE_WINE_VERSION}-x86_64.tar.xz"
INSTALL_DIR="${WINE_INSTALL_DIR:-/opt/wine-ge}"

log() { echo "${LOG_PREFIX} $*"; }
err() { echo "${LOG_PREFIX} ERROR: $*" >&2; exit 1; }

require_root() {
  if [[ $EUID -ne 0 ]]; then
    err "This script must be run as root (or via sudo)."
  fi
}

check_os() {
  if [[ "$(uname -s)" != "Linux" ]]; then
    err "This script is for Linux only."
  fi
  if ! command -v dpkg &>/dev/null; then
    err "Only Debian/Ubuntu-based systems are supported."
  fi
}

install_system_deps() {
  log "Installing system dependencies..."
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    wget \
    tar \
    xz-utils \
    cabextract \
    unzip \
    xvfb \
    x11-utils \
    libglib2.0-0 \
    libx11-6 \
    libxext6 \
    libxrender1 \
    libxrandr2 \
    libxi6 \
    libxxf86vm1 \
    libfreetype6 \
    libfontconfig1
  log "System dependencies installed."
}

install_winetricks() {
  if command -v winetricks &>/dev/null; then
    log "winetricks already installed, skipping."
    return
  fi
  log "Installing winetricks..."
  wget -q -O /usr/local/bin/winetricks \
    "https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks"
  chmod +x /usr/local/bin/winetricks
  log "winetricks installed."
}

install_wine_ge() {
  # Check if GE-Wine is already installed and matches the target version.
  local marker="${INSTALL_DIR}/.version"
  if [[ -f "${marker}" ]] && grep -q "${GE_WINE_VERSION}" "${marker}"; then
    log "GE-Wine ${GE_WINE_VERSION} already installed at ${INSTALL_DIR}."
    return
  fi

  log "Downloading GE-Wine ${GE_WINE_VERSION}..."
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "${tmp}"' EXIT

  if ! wget -q --show-progress -O "${tmp}/wine-ge.tar.xz" "${GE_WINE_URL}"; then
    log "Download failed. Falling back to standard Wine packages."
    install_wine_debian
    return
  fi

  log "Extracting GE-Wine to ${INSTALL_DIR}..."
  mkdir -p "${INSTALL_DIR}"
  tar -xf "${tmp}/wine-ge.tar.xz" -C "${INSTALL_DIR}" --strip-components=1
  echo "${GE_WINE_VERSION}" > "${marker}"

  # Add symlinks so 'wine' and 'wine64' resolve system-wide.
  ln -sf "${INSTALL_DIR}/bin/wine" /usr/local/bin/wine
  ln -sf "${INSTALL_DIR}/bin/wine64" /usr/local/bin/wine64
  ln -sf "${INSTALL_DIR}/bin/wineserver" /usr/local/bin/wineserver
  ln -sf "${INSTALL_DIR}/bin/wineboot" /usr/local/bin/wineboot

  log "GE-Wine ${GE_WINE_VERSION} installed successfully."
}

install_wine_debian() {
  log "Installing Wine from Debian/Ubuntu repositories..."

  # Enable 32-bit architecture (needed even for wine64 because of libs).
  dpkg --add-architecture i386 || true
  apt-get update -qq

  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    wine \
    wine64 \
    wine32 \
    || DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends wine

  log "Wine installed from distribution packages."
}

verify_wine() {
  local wine_bin
  wine_bin="$(command -v wine64 || command -v wine || true)"
  if [[ -z "${wine_bin}" ]]; then
    err "Wine installation failed: neither 'wine' nor 'wine64' found in PATH."
  fi
  local ver
  ver="$(WINEDEBUG=-all "${wine_bin}" --version 2>/dev/null)"
  log "Wine version: ${ver}"
}

main() {
  check_os
  require_root

  install_system_deps
  install_wine_ge
  install_winetricks
  verify_wine

  log "Wine setup complete."
  log "  wine: $(command -v wine64 || command -v wine)"
  log "  winetricks: $(command -v winetricks)"
  log "  xvfb-run: $(command -v xvfb-run)"
}

main "$@"
