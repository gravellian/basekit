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

# Replace placeholders (BSD/macOS safe). Limit to text files and use Perl to avoid sed locale issues.
export THEME_MACHINE THEME_NAME
find "$DEST_ROOT" -type f \
  \( -name "*.yml" -o -name "*.yaml" -o -name "*.scss" -o -name "*.css" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.info.yml" -o -name "*.libraries.yml" -o -name "gulpfile.js" -o -name "package.json" \) \
  -print0 | xargs -0 perl -pi -e 's/__THEME_MACHINE__/$ENV{THEME_MACHINE}/g; s/__THEME_NAME__/$ENV{THEME_NAME}/g'

echo "Scaffolded sub-theme at $DEST_ROOT"
echo "Next steps:"
echo "  cd $DEST_ROOT && npm install && npm run build"
echo "  drush then ${THEME_MACHINE} -y && drush cset system.theme default ${THEME_MACHINE} -y && drush cr"
