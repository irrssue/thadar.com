# Runbook: homelab services down after a power outage

## Symptom

Visiting thadar.com shows Cloudflare **Error 1033 (Cloudflare Tunnel error)** or curl returns **HTTP 530**.
This means Cloudflare is fine but cannot reach the `cloudflared` tunnel running on the homelab node.
The usual cause is the homelab machine being off or offline (power outage, dead battery, network down).

The same outage also affects every other service on the box: immich, nextcloud, jellyfin, pihole, dailying, and vantproof.
The root cause found during the 2026-07-05 outage: `systemd-resolved` was disabled, and `tailscaled` was
writing `/etc/resolv.conf` as a plain file pointed at MagicDNS (`100.100.100.100`) with an empty upstream
resolver list. With no working system DNS to fall back to, every non-tailnet hostname lookup SERVFAILed
forever - `cloudflared`'s SRV lookup, `myst`'s API calls, and any container that resolves an external
host at startup. Restarting `tailscaled` alone did not fix it, because nothing was feeding it a working
upstream resolver to forward to.

## Quick diagnosis (from any machine on the tailnet)

```sh
curl -sS -o /dev/null -w "%{http_code}\n" https://thadar.com   # 530 = tunnel down
tailscale status | grep homelab                                 # offline = machine is down
ssh irrssue@homelab "uptime"                                    # times out = machine is down
```

- If Tailscale shows homelab **offline**: the machine has no power or no network. Nothing can be fixed remotely.
- If homelab is **online** but the site is down: SSH in and check services (next section).

## Recovery once power is back

The machine should recover fully on its own if the guardrails below are installed.
If it does not, SSH in and run:

```sh
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
sudo systemctl restart systemd-resolved
sudo systemctl restart tailscaled
getent hosts github.com                              # must return an IP, not empty
sudo systemctl status cloudflared docker thadar-watchdog.timer
docker ps -a                                         # anything Exited or Restarting needs `docker compose up -d`
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001
sudo systemctl restart cloudflared                   # if the tunnel is still down after the DNS fix
```

`thadar-watchdog.timer` runs every 2 minutes and does all of the above automatically once installed
(see Guardrails below), so manual recovery should only be needed the first time the guardrails are set up.

## Guardrails (what prevents a repeat)

Installed by `docker/homeserver/harden-homeserver.sh` (run it once on the server, re-run any time):

1. Docker is enabled on boot.
2. `systemd-resolved` is enabled, `/etc/resolv.conf` is symlinked to its stub resolver, and a real
   upstream DNS (1.1.1.1 / 8.8.8.8) is set on the primary network interface. This fixes the root cause
   directly: Tailscale's split-DNS always has a working resolver to forward non-tailnet lookups to.
3. `cloudflared` is enabled on boot, ordered after `tailscaled` and `systemd-resolved`, and restarts
   forever with a 5 second backoff.
4. The laptop never sleeps: lid close is ignored and suspend/hibernate targets are masked.
5. The kernel reboots itself 10 seconds after a panic instead of hanging.
6. `thadar-watchdog.timer` runs every 2 minutes on the server and:
   - re-pins `/etc/resolv.conf` to the systemd-resolved stub and restarts `systemd-resolved` +
     `tailscaled` if a real DNS lookup fails
   - restarts `cloudflared` if it isn't active
   - runs `docker compose up -d` (with one retry) for every known compose stack on the box (thadar,
     immich, nextcloud, jellyfin, thadar-postgres, dailying, pihole, vantproof) so any container that
     didn't come back after the outage gets restarted
7. Wake on AC is enabled via Dell `cctk` when available, so the machine powers itself on when electricity returns.
   If `cctk` is not installed, set it manually in BIOS: Power Management > Wake on AC = Enabled.
8. An hourly cloud uptime monitor checks https://thadar.com and emails zawsawthura379@gmail.com when it is down: https://claude.ai/code/routines/trig_01La3kGnEumamysYur6p7Hww

## Remaining gap

A laptop battery only bridges a few hours of outage.
For longer outages the machine will still go down; the guardrails only guarantee it comes back by itself and that you get alerted.
If outages are frequent and long, consider a small UPS for the router/modem too, since the tunnel also dies when the network gear loses power.
