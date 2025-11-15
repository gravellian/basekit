#!/usr/bin/env bash
set -euo pipefail

THEME_MACHINE="${1:-}"
THEME_NAME="${2:-}"

if [[ -z "$THEME_MACHINE" || -z "$THEME_NAME" ]]; then
  echo "Usage: $0 <machine_name> \"Human Name\"" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STARTER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEST_ROOT="web/themes/custom/${THEME_MACHINE}"

mkdir -p "$DEST_ROOT/components"
rsync -a --exclude 'scripts' --exclude '.git' "$STARTER_ROOT/" "$DEST_ROOT/"

mv "$DEST_ROOT/__theme__.info.yml" "$DEST_ROOT/${THEME_MACHINE}.info.yml"
mv "$DEST_ROOT/__theme__.libraries.yml" "$DEST_ROOT/${THEME_MACHINE}.libraries.yml"

# Replace placeholders
LC_ALL=C find "$DEST_ROOT" -type f -print0 | xargs -0 sed -i '' \
  -e "s/__THEME_MACHINE__/${THEME_MACHINE}/g" \
  -e "s/__THEME_NAME__/${THEME_NAME}/g"

echo "Scaffolded sub-theme at $DEST_ROOT"
echo "Next steps:"
echo "  cd $DEST_ROOT && npm install && npm run build"
echo "  drush then ${THEME_MACHINE} -y && drush cset system.theme default ${THEME_MACHINE} -y && drush cr"

