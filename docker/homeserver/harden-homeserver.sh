#!/usr/bin/env bash
# Hardens the homelab node so thadar.com recovers automatically after a power outage.
# Idempotent: safe to re-run any time. Run on the server as: sudo bash harden-homeserver.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

echo "==> 1/7 Enable Docker on boot"
systemctl enable docker.service docker.socket

echo "==> 2/7 Fix the actual DNS root cause: systemd-resolved must own /etc/resolv.conf"
# Root cause of the "server up but everything DNS-dependent is down" failure:
# tailscaled was writing /etc/resolv.conf directly as a plain file pointed at
# 100.100.100.100 (MagicDNS) with an empty upstream resolver list, and
# systemd-resolved was disabled, so there was no working fallback resolver for
# any non-tailnet hostname (github.com, region1.v2.argotunnel.com, etc.).
# Fix: enable systemd-resolved, point /etc/resolv.conf at its stub, and give it
# a real upstream so tailscale's split-DNS has something to forward to.
systemctl enable --now systemd-resolved
ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf

PRIMARY_IFACE="$(ip route show default | awk '/default/ {print $5; exit}')"
if [[ -n "$PRIMARY_IFACE" ]]; then
  resolvectl dns "$PRIMARY_IFACE" 1.1.1.1 8.8.8.8 || echo "WARN: could not set upstream DNS on $PRIMARY_IFACE" >&2
else
  echo "WARN: could not detect primary network interface; set upstream DNS manually with 'resolvectl dns <iface> 1.1.1.1 8.8.8.8'" >&2
fi
systemctl restart systemd-resolved
systemctl restart tailscaled

echo "==> 3/7 Harden cloudflared (restart forever, start on boot)"
if systemctl list-unit-files | grep -q '^cloudflared.service'; then
  systemctl enable cloudflared.service
  mkdir -p /etc/systemd/system/cloudflared.service.d
  cat > /etc/systemd/system/cloudflared.service.d/override.conf <<'EOF'
[Unit]
# Never give up trying to restart the tunnel
StartLimitIntervalSec=0
After=tailscaled.service systemd-resolved.service
Wants=tailscaled.service systemd-resolved.service

[Service]
Restart=always
RestartSec=5
EOF
  systemctl daemon-reload
  systemctl restart cloudflared.service
else
  echo "WARN: no cloudflared.service found; if cloudflared runs in Docker ensure its restart policy is 'always'." >&2
fi

echo "==> 4/7 Never sleep: ignore lid close, mask suspend/hibernate"
mkdir -p /etc/systemd/logind.conf.d
cat > /etc/systemd/logind.conf.d/99-thadar-server.conf <<'EOF'
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
IdleAction=ignore
EOF
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
systemctl restart systemd-logind || true

echo "==> 5/7 Reboot automatically on kernel panic"
cat > /etc/sysctl.d/99-thadar-panic-reboot.conf <<'EOF'
kernel.panic = 10
kernel.panic_on_oops = 1
EOF
sysctl --system > /dev/null

echo "==> 6/7 Install homeserver watchdog (self-heal DNS, tunnel, and every docker stack every 2 minutes)"
install -m 0755 "$(dirname "$0")/thadar-watchdog.sh" /usr/local/bin/thadar-watchdog.sh

cat > /etc/systemd/system/thadar-watchdog.service <<'EOF'
[Unit]
Description=Homeserver self-healing watchdog (tailscale DNS, cloudflared, all docker compose stacks)
After=docker.service network-online.target tailscaled.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/thadar-watchdog.sh
EOF

cat > /etc/systemd/system/thadar-watchdog.timer <<'EOF'
[Unit]
Description=Run thadar watchdog every 2 minutes

[Timer]
OnBootSec=90
OnUnitActiveSec=2min

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now thadar-watchdog.timer

echo "==> 7/7 Auto power-on after AC power returns (Dell laptop)"
if command -v cctk > /dev/null 2>&1; then
  cctk --WakeOnAc=Enabled || echo "WARN: cctk could not set WakeOnAc; set it in BIOS (Power Management > Wake on AC)." >&2
else
  echo "NOTE: Dell Command Configure (cctk) not installed."
  echo "      Enable auto power-on in BIOS: Power Management > Wake on AC = Enabled."
  echo "      Until then the machine needs a manual power button press after an outage."
fi

echo "Done. Verify with: systemctl status cloudflared thadar-watchdog.timer && docker ps"
