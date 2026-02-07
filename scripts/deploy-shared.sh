#!/bin/bash
#
# Deploy shared assets to S3
# Usage: ./scripts/deploy-shared.sh [environment]
#
# Environments:
#   dev   - Deploy to /shared/dev/
#   test  - Deploy to /shared/v{version}/
#   prod  - Deploy to /shared/v{version}/ (same as test, different bucket optional)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SHARED_DIR="$PROJECT_ROOT/packages/shared"
VERSION_FILE="$SHARED_DIR/version.json"

# Configuration - update these for your AWS setup
S3_BUCKET="${SHARED_ASSETS_BUCKET:-your-shared-assets-bucket}"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check dependencies
check_dependencies() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Install it first."
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Install it first: brew install jq"
        exit 1
    fi
}

# Get version from version.json
get_version() {
    jq -r '.version' "$VERSION_FILE"
}

# Deploy to S3
deploy() {
    local env="${1:-dev}"
    local version=$(get_version)
    local s3_path=""

    case "$env" in
        dev)
            s3_path="s3://${S3_BUCKET}/shared/dev/"
            log_info "Deploying to DEV (latest)..."
            ;;
        test)
            s3_path="s3://${S3_BUCKET}/shared/v${version}/"
            log_info "Deploying to TEST as v${version}..."
            ;;
        prod)
            s3_path="s3://${S3_BUCKET}/shared/v${version}/"
            log_info "Deploying to PROD as v${version}..."
            ;;
        *)
            log_error "Unknown environment: $env"
            echo "Usage: $0 [dev|test|prod]"
            exit 1
            ;;
    esac

    log_info "Source: $SHARED_DIR"
    log_info "Target: $s3_path"
    log_info "Version: $version"

    # Sync to S3
    aws s3 sync "$SHARED_DIR" "$s3_path" \
        --exclude "version.json" \
        --exclude ".DS_Store" \
        --exclude "*.md" \
        --delete \
        --cache-control "public, max-age=31536000, immutable"

    log_info "Upload complete!"

    # Invalidate CloudFront cache if distribution ID is set
    if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
        log_info "Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
            --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
            --paths "/shared/*" \
            --output text
        log_info "Cache invalidation requested."
    else
        log_warn "CLOUDFRONT_DISTRIBUTION_ID not set. Skipping cache invalidation."
    fi

    echo ""
    log_info "Deployment complete!"
    echo ""
    echo "  Environment: $env"
    echo "  Version:     $version"
    echo "  S3 Path:     $s3_path"
    echo ""
    echo "  Update your service config to:"
    echo ""
    if [ "$env" == "dev" ]; then
        echo "    baseUrl: 'https://cdn.example.com/shared/dev'"
    else
        echo "    baseUrl: 'https://cdn.example.com/shared/v${version}'"
    fi
    echo ""
}

# Main
check_dependencies
deploy "$1"
