#!/bin/bash
#
# Bump shared assets version
# Usage: ./scripts/bump-version.sh [major|minor|patch] "changelog message"
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERSION_FILE="$PROJECT_ROOT/packages/shared/version.json"

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }

# Get current version
get_version() {
    jq -r '.version' "$VERSION_FILE"
}

# Bump version
bump_version() {
    local bump_type="${1:-patch}"
    local changelog="${2:-No changelog provided}"
    local current=$(get_version)

    # Parse version
    IFS='.' read -r major minor patch <<< "$current"

    case "$bump_type" in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            echo "Usage: $0 [major|minor|patch] \"changelog message\""
            exit 1
            ;;
    esac

    local new_version="${major}.${minor}.${patch}"
    local today=$(date +%Y-%m-%d)

    # Update version.json
    jq --arg v "$new_version" --arg d "$today" --arg c "$changelog" \
        '.version = $v | .released = $d | .changelog = $c' \
        "$VERSION_FILE" > "${VERSION_FILE}.tmp" && mv "${VERSION_FILE}.tmp" "$VERSION_FILE"

    log_info "Version bumped: $current → $new_version"
    echo ""
    cat "$VERSION_FILE"
    echo ""
}

bump_version "$1" "$2"
