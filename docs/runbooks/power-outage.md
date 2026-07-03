# Runbook: thadar.com down after a power outage

## Symptom

Visiting thadar.com shows Cloudflare **Error 1033 (Cloudflare Tunnel error)** or curl returns **HTTP 530**.
This means Cloudflare is fine but cannot reach the `cloudflared` tunnel running on the homelab node.
The usual cause is the homelab machine being off or offline (power outage, dead battery, network down).

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
sudo systemctl status cloudflared docker thadar-watchdog.timer
docker ps                                            # thadar_app should be Up
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001
sudo systemctl restart cloudflared                   # if the tunnel is down
docker compose -f ~/thadar.com/docker/homeserver/docker-compose.yml up -d
```

## Guardrails (what prevents a repeat)

Installed by `docker/homeserver/harden-homeserver.sh` (run it once on the server, re-run any time):

1. Docker and cloudflared are enabled on boot, and cloudflared restarts forever with a 5 second backoff.
2. The laptop never sleeps: lid close is ignored and suspend/hibernate targets are masked.
3. The kernel reboots itself 10 seconds after a panic instead of hanging.
4. `thadar-watchdog.timer` runs every 2 minutes on the server and restarts the app container or the tunnel if either stops responding.
5. Wake on AC is enabled via Dell `cctk` when available, so the machine powers itself on when electricity returns.
   If `cctk` is not installed, set it manually in BIOS: Power Management > Wake on AC = Enabled.
6. An hourly cloud uptime monitor checks https://thadar.com and emails zawsawthura379@gmail.com when it is down: https://claude.ai/code/routines/trig_01La3kGnEumamysYur6p7Hww

## Remaining gap

A laptop battery only bridges a few hours of outage.
For longer outages the machine will still go down; the guardrails only guarantee it comes back by itself and that you get alerted.
If outages are frequent and long, consider a small UPS for the router/modem too, since the tunnel also dies when the network gear loses power.
