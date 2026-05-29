#!/usr/bin/env bash
# setup-proton.sh — Downloads GE-Proton, creates a Wine prefix for ARK:SA,
# and installs required Windows components via winetricks.
# Idempotent: safe to re-run.
set -euo pipefail

LOG_PREFIX="[setup-proton]"

# ---- Configuration (can be overridden by env) ----
# Target GE-Proton version.  "latest" resolves via GitHub API.
GE_PROTON_VERSION="${GE_PROTON_VERSION:-latest}"
# Where compatibility tools are installed (Steam picks these up automatically).
COMPAT_DIR="${COMPAT_DIR:-${HOME}/.steam/root/compatibilitytools.d}"
# WINEPREFIX used for ARK:SA.
ARK_PREFIX="${ARK_PREFIX:-${HOME}/.local/share/ark-sa-wine}"
# winetricks components needed by ARK:SA.
WINETRICKS_PACKAGES="${WINETRICKS_PACKAGES:-vcrun2022 d3dcompiler_47 xact}"

log()  { echo "${LOG_PREFIX} $*"; }
err()  { echo "${LOG_PREFIX} ERROR: $*" >&2; exit 1; }
warn() { echo "${LOG_PREFIX} WARNING: $*" >&2; }

require_deps() {
  local missing=()
  for dep in curl tar xz; do
    command -v "${dep}" &>/dev/null || missing+=("${dep}")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    err "Missing required tools: ${missing[*]}. Run setup-wine.sh first."
  fi
}

resolve_ge_proton_version() {
  if [[ "${GE_PROTON_VERSION}" != "latest" ]]; then
    echo "${GE_PROTON_VERSION}"
    return
  fi
  log "Querying GitHub API for latest GE-Proton release..."
  local tag
  tag="$(curl -sfL \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/GloriousEggroll/proton-ge-custom/releases/latest" \
    | grep '"tag_name"' | head -1 | cut -d'"' -f4)"
  if [[ -z "${tag}" ]]; then
    err "Failed to query GitHub API. Set GE_PROTON_VERSION explicitly."
  fi
  echo "${tag}"
}

install_ge_proton() {
  local version
  version="$(resolve_ge_proton_version)"
  log "Target GE-Proton version: ${version}"

  local dest="${COMPAT_DIR}/${version}"
  if [[ -d "${dest}" ]]; then
    log "GE-Proton ${version} already installed at ${dest}."
    echo "${dest}"
    return
  fi

  local url="https://github.com/GloriousEggroll/proton-ge-custom/releases/download/${version}/${version}.tar.gz"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "${tmp}"' RETURN

  log "Downloading ${url}..."
  if ! curl -sfL --progress-bar -o "${tmp}/proton-ge.tar.gz" "${url}"; then
    warn "GE-Proton download failed. The Wine prefix will still be created without Proton."
    echo ""
    return
  fi

  mkdir -p "${COMPAT_DIR}"
  log "Extracting GE-Proton to ${COMPAT_DIR}..."
  tar -xzf "${tmp}/proton-ge.tar.gz" -C "${COMPAT_DIR}"

  log "GE-Proton ${version} installed."
  echo "${dest}"
}

setup_ark_prefix() {
  log "Setting up Wine prefix at ${ARK_PREFIX}..."

  local wine_bin
  wine_bin="$(command -v wine64 || command -v wine || true)"
  if [[ -z "${wine_bin}" ]]; then
    err "Wine not found. Run setup-wine.sh first."
  fi

  mkdir -p "${ARK_PREFIX}"

  # Only run wineboot if prefix is not yet initialised.
  if [[ ! -f "${ARK_PREFIX}/system.reg" ]]; then
    log "Initialising Wine prefix (wineboot --init)..."
    WINEDEBUG=-all WINEPREFIX="${ARK_PREFIX}" DISPLAY=":99" wineboot --init
    log "Wine prefix initialised."
  else
    log "Wine prefix already exists, skipping wineboot."
  fi
}

install_winetricks_components() {
  if ! command -v winetricks &>/dev/null; then
    warn "winetricks not found — skipping Windows component installation."
    warn "Install winetricks and re-run to add: ${WINETRICKS_PACKAGES}"
    return
  fi

  # Start a background Xvfb if no display is available.
  local xvfb_pid=""
  if ! xdpyinfo -display ":99" &>/dev/null 2>&1; then
    if command -v Xvfb &>/dev/null; then
      log "Starting temporary Xvfb on :99..."
      Xvfb :99 -screen 0 1024x768x24 &
      xvfb_pid=$!
      sleep 2
    fi
  fi

  log "Installing Windows components: ${WINETRICKS_PACKAGES}"
  WINEDEBUG=-all WINEPREFIX="${ARK_PREFIX}" DISPLAY=":99" \
    winetricks -q --unattended ${WINETRICKS_PACKAGES} || {
      warn "winetricks encountered errors. Some components may not be installed."
      warn "You can retry manually: WINEPREFIX=${ARK_PREFIX} winetricks ${WINETRICKS_PACKAGES}"
    }

  if [[ -n "${xvfb_pid}" ]]; then
    kill "${xvfb_pid}" 2>/dev/null || true
  fi

  log "Windows components installed."
}

print_summary() {
  log ""
  log "=== Setup Summary ==="
  log "Wine prefix: ${ARK_PREFIX}"
  log "Compat tools dir: ${COMPAT_DIR}"
  if [[ -d "${ARK_PREFIX}" ]]; then
    log "Prefix status: OK"
  else
    log "Prefix status: MISSING (check errors above)"
  fi
  log ""
  log "To start ARK:SA via Wine:"
  log "  WINEPREFIX=${ARK_PREFIX} scripts/ark-wrapper.sh /path/to/ArkAscendedServer.exe [ark-args...]"
}

main() {
  require_deps
  install_ge_proton
  setup_ark_prefix
  install_winetricks_components
  print_summary
}

main "$@"
