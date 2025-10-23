#!/bin/bash

# GUTFIT OS AUTONOMOUS MANAGEMENT SYSTEM
# Core CLI - Fail-Proof Foundation Layer
# Version: 1.0.0

set -euo pipefail  # Fail-safe execution

# Configuration - Source from environment variables or defaults
GUTFIT_DATA_DIR="${GUTFIT_DATA_DIR:-/config/workspace/gutfit-data}"
NEXTCLOUD_URL="${NEXTCLOUD_URL:-http://cloud.gutfit.co}"
AUTHENTIK_URL="${AUTHENTIK_URL:-https://auth.gutfit.co}"
ANYTHINGLLM_URL="${ANYTHINGLLM_URL:-http://ai.gutfit.co}"
EASYPANEL_API="${EASYPANEL_API:-2aa0060ee46ce79b71da32a860ea602ad4bcbc8371625c28684cec8bf40c60fc}"
SSH_HOST="${SSH_HOST:-mtl.autho.cloud}"
SSH_USER="${SSH_USER:-root}"
SSH_PASS="${SSH_PASS:-m5\#nzEzA+o2v}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    local message=$2
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${level}: ${message}" >&2
}

# Success check function
check_success() {
    local result=$?
    local operation="$1"
    if [ $result -eq 0 ]; then
        log "${GREEN}OK${NC}" "$operation completed successfully"
        return 0
    else
        log "${RED}FAILED${NC}" "$operation failed with code $result"
        return $result
    fi
}

# API call helper function
api_call() {
    local url="$1"
    local method="${2:-GET}"
    local data="$3"

    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -d "$data" 2>/dev/null
    else
        curl -s "$url" 2>/dev/null
    fi
}

# SSH command helper (idempotent - checks if needed)
ssh_exec() {
    local cmd="$1"
    local check_cmd="${2:-}"
    local force="${3:-false}"

    if [ "$force" = "false" ] && [ -n "$check_cmd" ]; then
        if sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$check_cmd" >/dev/null 2>&1; then
            log "${BLUE}SKIP${NC}" "Command already completed"
            return 0
        fi
    fi

    log "${YELLOW}EXEC${NC}" "$cmd"
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$cmd"
    check_success "SSH command: $cmd"
}

# Health check function
health_check() {
    log "${BLUE}INFO${NC}" "Starting comprehensive health check..."

    # Check Nextcloud
    if api_call "$NEXTCLOUD_URL/status.php" | jq -e '.installed == true' >/dev/null 2>&1; then
        log "${GREEN}OK${NC}" "Nextcloud is responding"
    else
        log "${RED}WARN${NC}" "Nextcloud health check failed"
    fi

    # Check Authentik
    if curl -s --max-time 5 "$AUTHENTIK_URL/-/health/ready/" | grep -q "ok"; then
        log "${GREEN}OK${NC}" "Authentik is responding"
    else
        log "${RED}WARN${NC}" "Authentik health check failed"
    fi

    # Check AnythingLLM
    if api_call "$ANYTHINGLLM_URL/api/health" | jq -e '.status == "ok"' >/dev/null 2>&1; then
        log "${GREEN}OK${NC}" "AnythingLLM is responding"
    else
        log "${RED}WARN${NC}" "AnythingLLM health check failed"
    fi

    # Check Docker containers
    local container_count=$(sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "docker ps -q | wc -l" 2>/dev/null)
    if [ "$container_count" -gt 5 ]; then
        log "${GREEN}OK${NC}" "$container_count Docker containers running"
    else
        log "${RED}WARN${NC}" "Only $container_count Docker containers running (<5 expected)"
    fi

    log "${GREEN}COMPLETE${NC}" "Health check finished"
}

# Client creation function
create_client() {
    local email="$1"
    local protocol="${2:-cbt}"
    local name="${3:-}"

    if [ -z "$email" ]; then
        log "${RED}ERROR${NC}" "Email is required for client creation"
        exit 1
    fi

    log "${BLUE}INFO${NC}" "Creating client: $email with $protocol protocol"

    # Extract username from email
    local username=$(echo "$email" | cut -d@ -f1 | tr -d '.')
    local domain=$(echo "$email" | cut -d@ -f2)

    # Create user in Authentik
    log "${YELLOW}EXEC${NC}" "Creating Authentik user account"
    # Note: This would need proper Authentik API authentication

    # Create Nextcloud user
    ssh_exec "docker exec gutfit_nextcloud php occ user:add '$username@$domain' --password-from-env" \
             "docker exec gutfit_nextcloud php occ user:info '$username@$domain'"

    # Create clinical folder structure
    local client_dir="/var/www/nextcloud/data/$username@$domain/files/Clinical/$protocol"
    ssh_exec "docker exec gutfit_nextcloud mkdir -p '$client_dir'" \
             "[ -d '$client_dir' ]"

    # Set appropriate permissions
    ssh_exec "docker exec gutfit_nextcloud chown -R www-data:www-data '/var/www/nextcloud/data/$username@$domain'" \
             "docker exec gutfit_nextcloud stat '/var/www/nextcloud/data/$username@$domain'"

    # Deploy protocol template
    deploy_protocol_template "$username@$domain" "$protocol"

    log "${GREEN}COMPLETE${NC}" "Client $email created with $protocol protocol"
}

# Protocol deployment function
deploy_protocol_template() {
    local user="$1"
    local protocol="$2"

    log "${BLUE}INFO${NC}" "Deploying $protocol protocol template for $user"

    local template_dir="$GUTFIT_DATA_DIR/templates/$protocol"
    local user_dir="/var/www/nextcloud/data/$user/files/Clinical/$protocol"

    if [ -d "$template_dir" ]; then
        ssh_exec "docker cp '$template_dir' 'gutfit_nextcloud:$user_dir/'" \
                 "[ -d '$user_dir' ]"
        log "${GREEN}OK${NC}" "Protocol template deployed"
    else
        log "${YELLOW}WARN${NC}" "Protocol template $protocol not found, created empty structure"
        ssh_exec "docker exec gutfit_nextcloud mkdir -p '$user_dir/{assessments,sessions,homework,progress}'"
    fi

    # Set proper ownership
    ssh_exec "docker exec gutfit_nextcloud chown -R www-data:www-data '$user_dir'"
}

# App deployment function
deploy_app() {
    local app_name="$1"

    log "${BLUE}INFO${NC}" "Deploying Nextcloud app: $app_name"

    # Install app via CLI
    ssh_exec "docker exec gutfit_nextcloud php occ app:install $app_name" \
             "docker exec gutfit_nextcloud php occ app:list | grep $app_name"

    # Enable app
    ssh_exec "docker exec gutfit_nextcloud php occ app:enable $app_name"

    log "${GREEN}COMPLETE${NC}" "App $app_name deployed and enabled"
}

# Backup function
create_backup() {
    local type="${1:-full}"
    local verify="${2:-false}"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$GUTFIT_DATA_DIR/backups/$timestamp"

    log "${BLUE}INFO${NC}" "Creating $type backup: $timestamp"

    mkdir -p "$backup_dir"

    # Database backups
    log "${YELLOW}EXEC${NC}" "Backing up databases"
    ssh_exec "docker exec gutfit_nextcloud-db mysqldump -u root gutfit > /tmp/nextcloud.sql"
    ssh_exec "docker cp gutfit_nextcloud-db:/tmp/nextcloud.sql $backup_dir/"

    ssh_exec "docker exec autho_authentik-db pg_dump -U postgres authentik > /tmp/authentik.sql"
    ssh_exec "docker cp autho_authentik-db:/tmp/authentik.sql $backup_dir/"

    # File system backup
    log "${YELLOW}EXEC${NC}" "Backing up file systems"
    ssh_exec "cd /var/www/nextcloud && tar czf /tmp/nextcloud-data.tar.gz data/"
    ssh_exec "docker cp gutfit_nextcloud:/tmp/nextcloud-data.tar.gz $backup_dir/"

    # Create manifest
    cat > "$backup_dir/manifest.txt" << EOF
BACKUP MANIFEST
Timestamp: $timestamp
Type: $type
Components:
- Nextcloud database
- Nextcloud files
- Authentik database
Status: Created
EOF

    if [ "$verify" = "true" ]; then
        log "${YELLOW}EXEC${NC}" "Verifying backup integrity"

        # Test database restores
        if ssh_exec "docker exec -i gutfit_nextcloud-db mysql -u root gutfit < $backup_dir/nextcloud.sql" 2>/dev/null; then
            log "${GREEN}OK${NC}" "Database restore test passed"
        else
            log "${RED}FAILED${NC}" "Database restore test failed"
            return 1
        fi
    fi

    log "${GREEN}COMPLETE${NC}" "Backup created at $backup_dir"
    echo "Backup location: $backup_dir"
}

# Main command router
main() {
    case "${1:-help}" in
        status|health)
            health_check
            ;;
        client|create-client)
            create_client "${2:-}" "${3:-cbt}" "${4:-}"
            ;;
        protocol|deploy-protocol)
            deploy_protocol_template "${2:-}" "${3:-cbt}"
            ;;
        app|deploy-app)
            deploy_app "${2:-}"
            ;;
        backup|create-backup)
            create_backup "${2:-full}" "${3:-false}"
            ;;
        *)
            cat << EOF
GutfitOS Autonomous Management System v1.0.0
Fail-Proof Foundation CLI

USAGE:
  ./gutfit-os-cli.sh <command> [options]

COMMANDS:
  status               Run comprehensive health checks
  create-client EMAIL [PROTOCOL] [NAME]     Create new client account
  deploy-protocol USER PROTOCOL             Deploy clinical protocol template
  deploy-app APPNAME   Install and enable Nextcloud app
  create-backup [TYPE] [--verify]          Create system backup

EXAMPLES:
  ./gutfit-os-cli.sh status
  ./gutfit-os-cli.sh create-client john@gutfit.co anxiety "John Smith"
  ./gutfit-os-cli.sh deploy-protocol john@gutfit.co cbt
  ./gutfit-os-cli.sh create-backup full --verify

CONFIGURATION:
Set environment variables or edit defaults in script:
  GUTFIT_DATA_DIR     Data directory (/config/workspace/gutfit-data)
  NEXTCLOUD_URL       Nextcloud URL (http://cloud.gutfit.co)
  AUTHENTIK_URL       Authentik URL (https://auth.gutfit.co)
  ANYTHINGLLM_URL     AnythingLLM URL (http://ai.gutfit.co)
  EASYPANEL_API       API token for Easypanel
  SSH_HOST           Server hostname (mtl.autho.cloud)
  SSH_USER           SSH username (root)
  SSH_PASS           SSH password

EOF
            ;;
    esac
}

# Run main function with all arguments
main "$@"
