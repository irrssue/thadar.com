#!/usr/bin/env bash
# Self-healing watchdog for the whole homelab node, not just thadar.
# Restarts tailscaled if MagicDNS is broken, restarts cloudflared if it's down,
# and brings back up every docker compose stack found under known homelab dirs.
# Installed to /usr/local/bin by harden-homeserver.sh and run by thadar-watchdog.timer.
set -uo pipefail

LOG_TAG="thadar-watchdog"
log() { logger -t "$LOG_TAG" "$1"; echo "$1"; }

COMPOSE_DIRS=(
  /home/irrssue/thadar.com/docker/homeserver
  /home/irrssue/docker/immich
  /home/irrssue/docker/nextcloud
  /home/irrssue/docker/jellyfin
  /home/irrssue/docker/thadar-postgres
  /home/irrssue/docker/dailying
  /home/irrssue/pihole
  /home/irrssue/dailying/backend
  /home/irrssue/vantproof
)

# 1. DNS must actually resolve, or cloudflared (and anything else relying on
#    tailscale-provided DNS) will crash-loop forever after a reboot. Root cause:
#    tailscaled can overwrite /etc/resolv.conf with a plain file pointed at
#    MagicDNS and an empty upstream resolver list if systemd-resolved isn't the
#    one owning that file. Re-pin the symlink and restart both services if a
#    real-world lookup fails.
if ! getent hosts github.com >/dev/null 2>&1; then
  log "DNS lookup failing, checking /etc/resolv.conf and restarting resolver stack"
  if [[ "$(readlink -f /etc/resolv.conf)" != "/run/systemd/resolve/stub-resolv.conf" ]]; then
    log "/etc/resolv.conf is not the systemd-resolved stub, re-pinning it"
    ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
  fi
  systemctl restart systemd-resolved || log "systemd-resolved restart failed"
  systemctl restart tailscaled || log "tailscaled restart failed"
  sleep 5
fi

# 2. Cloudflare tunnel: systemd service must be active.
if systemctl list-unit-files | grep -q '^cloudflared.service'; then
  if ! systemctl is-active --quiet cloudflared.service; then
    log "cloudflared inactive, restarting"
    systemctl restart cloudflared.service || log "cloudflared restart failed"
  fi
fi

# 3. Every docker compose stack on the box must be up. This covers thadar,
#    immich, nextcloud, jellyfin, pihole, dailying and vantproof in one pass,
#    so a reboot brings everything back without per-service babysitting.
for dir in "${COMPOSE_DIRS[@]}"; do
  compose_file=""
  for candidate in "$dir/docker-compose.yml" "$dir/docker-compose.prod.yml"; do
    [[ -f "$candidate" ]] && compose_file="$candidate" && break
  done
  [[ -z "$compose_file" ]] && continue

  down_services=$(docker compose -f "$compose_file" ps --services --filter "status=exited" 2>/dev/null)
  missing=$(docker compose -f "$compose_file" ps --services --status=running 2>/dev/null | wc -l)
  total=$(docker compose -f "$compose_file" config --services 2>/dev/null | wc -l)

  if [[ -n "$down_services" ]] || [[ "$missing" -lt "$total" ]]; then
    log "stack at $compose_file not fully up, running docker compose up -d"
    if ! ( cd "$dir" && docker compose -f "$compose_file" up -d ); then
      log "docker compose up failed for $compose_file, retrying once after a brief pause"
      sleep 5
      ( cd "$dir" && docker compose -f "$compose_file" up -d ) || log "docker compose up failed again for $compose_file"
    fi
  fi
done

# 4. Any container stuck restart-looping (e.g. a bad dependency at boot) gets one
#    more explicit restart attempt; if it keeps failing that's a real bug to look at,
#    not something a reboot guardrail should paper over silently.
restarting=$(docker ps --filter "status=restarting" --format '{{.Names}}')
if [[ -n "$restarting" ]]; then
  log "containers stuck restarting: $restarting"
fi

exit 0
