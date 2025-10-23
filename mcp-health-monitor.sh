#!/bin/bash

# GutfitOS Health Monitor MCP Server
# Autonomous Monitoring & Self-Healing System
# Continuously monitors all services and performs automated maintenance

set -euo pipefail

SERVER="mtl.autho.cloud"
USER="root"
PASSWORD="m5#nzEzA+o2v"
EMAIL_TO="alert@gutfit.co"

# Metrics tracking
HEALTH_LOG="/config/workspace/health-monitor.log"
METRICS_FILE="/config/workspace/metrics.json"

# Function to send alerts
send_alert() {
    local subject="$1"
    local message="$2"
    echo "$(date): $subject - $message" >> "$HEALTH_LOG"
    # In production: send email/SMS webhook
}

# Service health checks
check_authentik() {
    if curl -s --max-time 5 "https://auth.gutfit.co/-/health/ready/" | grep -q "ok"; then
        echo "authentik:healthy"
    else
        echo "authentik:unhealthy"
        send_alert "Authentik Alert" "Authentik service is unresponsive"
    fi
}

check_nextcloud() {
    if sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ status" >/dev/null 2>&1; then
        echo "nextcloud:healthy"
    else
        echo "nextcloud:unhealthy"
        send_alert "Nextcloud Alert" "Nextcloud service needs attention"
    fi
}

check_anythingllm() {
    if curl -s --max-time 5 "http://ai.gutfit.co/api/health" >/dev/null 2>&1; then
        echo "anythingllm:healthy"
    else
        echo "anythingllm:unhealthy"
        send_alert "AI Assistant Alert" "AnythingLLM service is down"
    fi
}

# Auto-healing actions
heal_nextcloud() {
    echo "$(date): Attempting Nextcloud auto-heal" >> "$HEALTH_LOG"

    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'EOF'
    # Restart container if unhealthy
    docker restart gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn

    # Clear caches
    docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ maintenance:repair

    # Precompile assets
    docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ app:enable richdocuments
    docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ files:scan --all

    echo "$(date): Nextcloud auto-heal completed"
EOF
}

# Performance optimization
optimize_system() {
    echo "$(date): Running system optimizations" >> "$HEALTH_LOG"

    # Clear old docker images
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "docker image prune -f >/dev/null 2>&1"

    # Update package caches
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "apt update >/dev/null 2>&1"

    # Rotate logs
    if [ -f "$HEALTH_LOG" ]; then
        tail -1000 "$HEALTH_LOG" > "$HEALTH_LOG.tmp" && mv "$HEALTH_LOG.tmp" "$HEALTH_LOG"
    fi
}

# Usage analytics collection
collect_metrics() {
    local metrics=$(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "services": {
    $(check_authentik),
    $(check_nextcloud),
    $(check_anythingllm)
  },
  "system": {
    "uptime": "$(uptime)",
    "load_average": "$(cat /proc/loadavg | cut -d' ' -f1-3)",
    "disk_usage": "$(df / | tail -1 | awk '{print $5}')"
  }
}
EOF
)

    echo "$metrics" > "$METRICS_FILE"
}

# Self-improvement analysis
analyze_improvements() {
    # Analyze error patterns
    if grep -q "Nextcloud.*unhealthy" "$HEALTH_LOG" | tail -5 | head -4 | grep -E "(Nextcloud.*unhealthy)" >/dev/null; then
        echo "$(date): Nextcloud instability detected - scheduling container update" >> "$HEALTH_LOG"
        # In production: trigger automated refresh/update process
    fi

    # Check for signup conversion
    # Analyze user engagement metrics
    # Optimize based on usage patterns
}

# Main monitoring loop
main() {
    echo "$(date): GutfitOS Health Monitor started" >> "$HEALTH_LOG"

    while true; do
        collect_metrics

        # Check all services
        local need_healing=0

        if ! check_authentik | grep -q "healthy"; then
            need_healing=1
        fi

        if ! check_nextcloud | grep -q "healthy"; then
            heal_nextcloud
        fi

        if ! check_anythingllm | grep -q "healthy"; then
            need_healing=1
        fi

        # Perform optimizations
        optimize_system

        # Analyze for improvements
        analyze_improvements

        echo "$(date): Health check cycle completed" >> "$HEALTH_LOG"
        sleep 300  # 5 minute intervals
    done
}

# Run main function
main
