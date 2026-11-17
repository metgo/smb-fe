#!/usr/bin/env bash
# Builds the Workspace onboarding demo (fake backend, no server) from this
# repository's workspace-fe. The product code is not changed: the demo
# patches a temporary copy.
#
# Usage: demo/onboarding/build/build-demo.sh [out dir]
#   out dir defaults to demo/onboarding/dist
# Needs: node + yarn (run `yarn install` in workspace-fe once), python3.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../../.." && pwd)"
SRC="$REPO/workspace-fe"
OUT="$(mkdir -p "${1:-$HERE/../dist}" && cd "${1:-$HERE/../dist}" && pwd)"
WORK="$(mktemp -d)/workspace-fe"

if [ ! -d "$SRC/node_modules" ]; then
  echo "Installing workspace-fe dependencies (first run only)..."
  (cd "$SRC" && yarn install --frozen-lockfile)
fi

mkdir -p "$WORK"
tar -C "$SRC" --exclude=node_modules --exclude=dist -cf - . | tar -C "$WORK" -xf -
ln -s "$SRC/node_modules" "$WORK/node_modules"
mkdir -p "$WORK/src/demo"
cp "$HERE/mockBackend.ts" "$WORK/src/demo/mockBackend.ts"
cp "$HERE/samples.ts" "$WORK/src/demo/samples.ts"
python3 "$HERE/patch-demo.py" "$WORK"
(cd "$WORK" && npx vite build --config vite.demo.config.ts --outDir "$OUT" --emptyOutDir)
echo "Built demo into $OUT"
