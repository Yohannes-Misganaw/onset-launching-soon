#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSH_HOST="${DEPLOY_SSH_HOST:-onset}"
SSH_CONFIG="${DEPLOY_SSH_CONFIG:-$HOME/.ssh/config}"
APP_ROOT="${DEPLOY_APP_ROOT:-onset-app}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://onset.et}"
BUNDLE="$(mktemp -d)"
trap 'rm -rf "$BUNDLE"' EXIT

ssh_run() {
  ssh -F "$SSH_CONFIG" "$SSH_HOST" "$@"
}

cd "$ROOT"
NEXT_PUBLIC_SITE_URL="$SITE_URL" npm run build

rsync -aL --exclude '.env*' .next/standalone/ "$BUNDLE/"
mkdir -p "$BUNDLE/.next"
rsync -a .next/static "$BUNDLE/.next/"
rsync -a public/ "$BUNDLE/public/"

if [ -e "$BUNDLE/.env" ] || [ -n "$(find "$BUNDLE" -type l -print -quit)" ]; then
  echo "Bundle check failed: .env or symlinks present" >&2
  exit 1
fi

rsync -az --delete --exclude 'tmp/' --exclude 'stderr.log' \
  -e "ssh -F $SSH_CONFIG" "$BUNDLE/" "$SSH_HOST:$APP_ROOT/"

ssh_run "cloudlinux-selector restart --json --interpreter nodejs --app-root $APP_ROOT"
echo "Deployed to $SSH_HOST:$APP_ROOT ($SITE_URL)"
