#!/usr/bin/env bash
# Self-healing watchdog for the thadar homelab node.
# Restarts the app container and the Cloudflare tunnel if either stops responding.
# Installed to /usr/local/bin by harden-homeserver.sh and run by thadar-watchdog.timer.
set -uo pipefail

COMPOSE_FILE="/home/irrssue/thadar.com/docker/homeserver/docker-compose.yml"
APP_URL="http://127.0.0.1:3001"
LOG_TAG="thadar-watchdog"

log() { logger -t "$LOG_TAG" "$1"; echo "$1"; }

# 1. App container: must exist, be running, and answer HTTP.
if ! curl -fsS -o /dev/null --max-time 10 "$APP_URL"; then
  log "app not responding on $APP_URL, restarting thadar_app"
  if docker ps -a --format '{{.Names}}' | grep -qx thadar_app; then
    docker restart thadar_app || log "docker restart failed"
  elif [[ -f "$COMPOSE_FILE" ]]; then
    docker compose -f "$COMPOSE_FILE" up -d || log "docker compose up failed"
  else
    log "no thadar_app container and no compose file at $COMPOSE_FILE"
  fi
fi

# 2. Cloudflare tunnel: systemd service must be active.
if systemctl list-unit-files | grep -q '^cloudflared.service'; then
  if ! systemctl is-active --quiet cloudflared.service; then
    log "cloudflared inactive, restarting"
    systemctl restart cloudflared.service || log "cloudflared restart failed"
  fi
fi

exit 0
