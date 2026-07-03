#!/usr/bin/env bash
# Hardens the homelab node so thadar.com recovers automatically after a power outage.
# Idempotent: safe to re-run any time. Run on the server as: sudo bash harden-homeserver.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0" >&2
  exit 1
fi

echo "==> 1/6 Enable Docker on boot"
systemctl enable docker.service docker.socket

echo "==> 2/6 Harden cloudflared (restart forever, start on boot)"
if systemctl list-unit-files | grep -q '^cloudflared.service'; then
  systemctl enable cloudflared.service
  mkdir -p /etc/systemd/system/cloudflared.service.d
  cat > /etc/systemd/system/cloudflared.service.d/override.conf <<'EOF'
[Unit]
# Never give up trying to restart the tunnel
StartLimitIntervalSec=0

[Service]
Restart=always
RestartSec=5
EOF
  systemctl daemon-reload
  systemctl restart cloudflared.service
else
  echo "WARN: no cloudflared.service found; if cloudflared runs in Docker ensure its restart policy is 'always'." >&2
fi

echo "==> 3/6 Never sleep: ignore lid close, mask suspend/hibernate"
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

echo "==> 4/6 Reboot automatically on kernel panic"
cat > /etc/sysctl.d/99-thadar-panic-reboot.conf <<'EOF'
kernel.panic = 10
kernel.panic_on_oops = 1
EOF
sysctl --system > /dev/null

echo "==> 5/6 Install thadar watchdog (self-heal app + tunnel every 2 minutes)"
install -m 0755 "$(dirname "$0")/thadar-watchdog.sh" /usr/local/bin/thadar-watchdog.sh

cat > /etc/systemd/system/thadar-watchdog.service <<'EOF'
[Unit]
Description=Thadar self-healing watchdog
After=docker.service network-online.target
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

echo "==> 6/6 Auto power-on after AC power returns (Dell laptop)"
if command -v cctk > /dev/null 2>&1; then
  cctk --WakeOnAc=Enabled || echo "WARN: cctk could not set WakeOnAc; set it in BIOS (Power Management > Wake on AC)." >&2
else
  echo "NOTE: Dell Command Configure (cctk) not installed."
  echo "      Enable auto power-on in BIOS: Power Management > Wake on AC = Enabled."
  echo "      Until then the machine needs a manual power button press after an outage."
fi

echo "Done. Verify with: systemctl status cloudflared thadar-watchdog.timer && docker ps"
