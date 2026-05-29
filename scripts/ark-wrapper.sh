#!/usr/bin/env bash
# ark-wrapper.sh — Headless wrapper that launches the ARK:SA Windows server binary
# via Wine + Xvfb.  Handles display setup, logging, and clean shutdown.
# Usage: ark-wrapper.sh <path-to-ArkAscendedServer.exe> [ark-server-args...]
set -euo pipefail

LOG_PREFIX="[ark-wrapper]"
TIMESTAMP_FMT="%Y-%m-%dT%H:%M:%S"

# ---- Configuration (can be overridden by env) ----
ARK_PREFIX="${ARK_PREFIX:-${HOME}/.local/share/ark-sa-wine}"
DISPLAY_NUM="${DISPLAY_NUM:-:1}"
XVFB_SCREEN="${XVFB_SCREEN:-0}"
XVFB_RESOLUTION="${XVFB_RESOLUTION:-1024x768x24}"
LOG_DIR="${LOG_DIR:-${HOME}/.local/share/ark-sa-logs}"
ARK_LOG_FILE="${ARK_LOG_FILE:-${LOG_DIR}/ark-server.log}"
WINE_BIN="${WINE_BIN:-}"  # auto-detected if empty

log()  { echo "$(date +"${TIMESTAMP_FMT}") ${LOG_PREFIX} $*" | tee -a "${ARK_LOG_FILE}"; }
err()  { echo "$(date +"${TIMESTAMP_FMT}") ${LOG_PREFIX} ERROR: $*" | tee -a "${ARK_LOG_FILE}" >&2; exit 1; }
warn() { echo "$(date +"${TIMESTAMP_FMT}") ${LOG_PREFIX} WARNING: $*" | tee -a "${ARK_LOG_FILE}" >&2; }

xvfb_pid=""
wine_pid=""

cleanup() {
  log "Shutting down..."
  if [[ -n "${wine_pid}" ]] && kill -0 "${wine_pid}" 2>/dev/null; then
    log "Stopping ARK:SA process (PID ${wine_pid})..."
    kill -SIGTERM "${wine_pid}" 2>/dev/null || true
    # Give ARK up to 30 s to save and exit gracefully.
    local waited=0
    while kill -0 "${wine_pid}" 2>/dev/null && (( waited < 30 )); do
      sleep 1
      (( waited++ ))
    done
    kill -SIGKILL "${wine_pid}" 2>/dev/null || true
  fi

  if [[ -n "${xvfb_pid}" ]] && kill -0 "${xvfb_pid}" 2>/dev/null; then
    log "Stopping Xvfb (PID ${xvfb_pid})..."
    kill -SIGTERM "${xvfb_pid}" 2>/dev/null || true
  fi

  log "Shutdown complete."
}
trap cleanup SIGINT SIGTERM EXIT

validate_args() {
  if [[ $# -lt 1 ]]; then
    err "Usage: $0 <path-to-ArkAscendedServer.exe> [ark-args...]"
  fi
  local exe="$1"
  if [[ ! -f "${exe}" ]]; then
    err "ARK server binary not found: ${exe}"
  fi
}

check_dependencies() {
  local missing=()
  for dep in Xvfb xdpyinfo; do
    command -v "${dep}" &>/dev/null || missing+=("${dep}")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    err "Missing dependencies: ${missing[*]}. Install with: sudo apt-get install xvfb x11-utils"
  fi

  if [[ -z "${WINE_BIN}" ]]; then
    WINE_BIN="$(command -v wine64 || command -v wine || true)"
  fi
  if [[ -z "${WINE_BIN}" ]]; then
    err "Wine not found in PATH. Run scripts/setup-wine.sh first."
  fi

  if [[ ! -f "${ARK_PREFIX}/system.reg" ]]; then
    err "Wine prefix not initialised at ${ARK_PREFIX}. Run scripts/setup-proton.sh first."
  fi
}

start_xvfb() {
  if xdpyinfo -display "${DISPLAY_NUM}" &>/dev/null 2>&1; then
    log "Xvfb already running on ${DISPLAY_NUM}, reusing."
    return
  fi

  log "Starting Xvfb on display ${DISPLAY_NUM} (${XVFB_RESOLUTION})..."
  Xvfb "${DISPLAY_NUM}" -screen "${XVFB_SCREEN}" "${XVFB_RESOLUTION}" &
  xvfb_pid=$!

  # Wait up to 10 s for the display to become available.
  local waited=0
  until xdpyinfo -display "${DISPLAY_NUM}" &>/dev/null 2>&1; do
    sleep 0.5
    (( waited++ ))
    if (( waited >= 20 )); then
      err "Xvfb failed to start within 10 seconds."
    fi
  done
  log "Xvfb started (PID ${xvfb_pid})."
}

start_ark() {
  local exe="$1"
  shift
  local ark_args=("$@")

  log "Starting ARK:SA server: ${exe}"
  log "  Args: ${ark_args[*]:-<none>}"
  log "  Wine: ${WINE_BIN}"
  log "  Prefix: ${ARK_PREFIX}"
  log "  Display: ${DISPLAY_NUM}"

  WINEPREFIX="${ARK_PREFIX}" \
  DISPLAY="${DISPLAY_NUM}" \
  WINEDEBUG="-all" \
  WINEDLLOVERRIDES="mscoree,mshtml=" \
    "${WINE_BIN}" "${exe}" "${ark_args[@]}" \
    >> "${ARK_LOG_FILE}" 2>&1 &

  wine_pid=$!
  log "ARK:SA server started (Wine PID ${wine_pid})."
}

wait_for_ark() {
  log "Monitoring ARK:SA process (PID ${wine_pid})..."
  wait "${wine_pid}" || true
  local exit_code=$?
  if [[ ${exit_code} -ne 0 ]]; then
    warn "ARK:SA exited with code ${exit_code}. Check logs: ${ARK_LOG_FILE}"
  else
    log "ARK:SA exited cleanly."
  fi
}

main() {
  mkdir -p "${LOG_DIR}"
  log "=== ARK:SA Wine Wrapper starting ==="

  validate_args "$@"
  check_dependencies
  start_xvfb
  start_ark "$@"
  wait_for_ark

  log "=== ARK:SA Wine Wrapper done ==="
}

main "$@"
