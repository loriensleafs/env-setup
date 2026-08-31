#!/bin/sh
# envsetup bootstrap shim — the single sanctioned non-bun script (runs before bun exists).
# Usage: curl -fsSL https://raw.githubusercontent.com/loriensleafs/env-setup/main/install.sh | sh
set -eu
REPO="loriensleafs/env-setup"
ARCH="$(uname -m)"
case "$ARCH" in
  arm64)  ASSET="envsetup-darwin-arm64" ;;
  x86_64) ASSET="envsetup-darwin-x64" ;;
  *) echo "unsupported architecture: $ARCH" >&2; exit 1 ;;
esac
URL="https://github.com/$REPO/releases/latest/download/$ASSET"
DEST="${TMPDIR:-/tmp}/envsetup"
echo "Downloading envsetup ($ASSET)..."
# Always write a FRESH file: overwriting a binary that macOS already executed
# from this path (a previous run) can get the new one SIGKILLed (exit 137) by
# the code-signing cache. Observed on a re-run 2026-08-30; rm first = new inode.
rm -f "$DEST"
curl -fsSL -o "$DEST" "$URL"
chmod +x "$DEST"
# NOTE: no `</dev/tty` re-attach here — Bun cannot read input from a
# shell-redirect-opened tty (verified empirically; the process freezes). The
# binary itself detects piped stdin and opens /dev/tty internally instead.
exec "$DEST" "$@"
