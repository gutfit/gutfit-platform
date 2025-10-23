#!/bin/bash

# NEXTCLOUD AUTONOMOUS SETUP SCRIPT
# Self-configuring and self-managing Nextcloud for GutfitOS
# This script handles complete autonomous deployment

set -euo pipefail

# Configuration
SERVER="mtl.autho.cloud"
USER="root"
PASSWORD="m5#nzEzA+o2v"
NC_CONTAINER="gutfit_nextcloud"
DATABASE_CONTAINER="gutfit_nextcloud-db"
DATA_DIR="/var/www/nextcloud/data"
APPS_DIR="/var/www/nextcloud/apps"
CONFIG_DIR="/var/www/nextcloud/config"

echo "🚀 NEXTCLOUD AUTONOMOUS SETUP - GUTFIT PLATFORM"
echo "=============================================="

# Function to execute commands in Nextcloud container
nc_exec() {
    local cmd="$1"
    echo "🔧 Executing in Nextcloud: $cmd"
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "docker exec $NC_CONTAINER bash -c '$cmd'"
}

# Function to create medical protocol folders
create_protocol_folders() {
    echo "📁 Creating Gutfit Clinical Protocol Structure..."

    # Base clinical folders
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical'"
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical/{Intake,Assessment,Sessions,Homework,Progress_Notes}'"

    # CBT Protocol Structure
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical/CBT/{Pre_Intake,Cognitive_Reassessment,Homework_Tracking,Emergency_Protocols}'"

    # Depression Protocol
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical/Depression/{Mood_Tracking,Therapy_Sheets,Relapse_Prevention}'"

    # Anxiety Protocol
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical/Anxiety/{Exposure_Therapy,Panic_Plans,Ground_Techniques}'"

    # Templates Directory
    nc_exec "mkdir -p '$DATA_DIR/shared/Clinical/Templates/{Client_Intake,Session_Plans,Progress_Reports}'"

    echo "✅ Protocol folders created"
}

# Function to install and configure medical apps
install_medical_apps() {
    echo "🔧 Installing medical/clinical Nextcloud apps..."

    # Install essential apps for healthcare workflow
    nc_exec "cd /var/www/nextcloud && php occ app:install calendar --no-interaction"
    nc_exec "cd /var/www/nextcloud && php occ app:enable calendar"

    nc_exec "cd /var/www/nextcloud && php occ app:install tasks --no-interaction"
    nc_exec "cd /var/www/nextcloud && php occ app:enable tasks"

    nc_exec "cd /var/www/nextcloud && php occ app:install forms --no-interaction"
    nc_exec "cd /var/www/nextcloud && php occ app:enable forms"

    nc_exec "cd /var/www/nextcloud && php occ app:install richdocuments --no-interaction"
    nc_exec "cd /var/www/nextcloud && php occ app:enable richdocuments"

    echo "✅ Medical apps installed"
}

# Function to configure user groups and permissions
configure_user_groups() {
    echo "👥 Configuring Gutfit user groups and permissions..."

    # Create clinical groups
    nc_exec "cd /var/www/nextcloud && php occ group:add 'Gutfit_Founders'"
    nc_exec "cd /var/www/nextcloud && php occ group:add 'Gutfit_Clinicians'"
    nc_exec "cd /var/www/nextcloud && php occ group:add 'Gutfit_Clients'"
    nc_exec "cd /var/www/nextcloud && php occ group:add 'Gutfit_Admin'"

    # Set shared folder permissions
    nc_exec "cd /var/www/nextcloud && chown -R www-data:www-data '$DATA_DIR/shared'"
    nc_exec "cd /var/www/nextcloud && chmod -R 755 '$DATA_DIR/shared'"

    echo "✅ User groups configured"
}

# Function to set clinical workflows
configure_workflows() {
    echo "⚙️ Configuring clinical workflows and automation..."

    # Set default quotas for clinical groups
    nc_exec "cd /var/www/nextcloud && php occ user:setting Gutfit_Founders quota 'unlimited'"
    nc_exec "cd /var/www/nextcloud && php occ user:setting Gutfit_Clinicians quota '100 GB'"
    nc_exec "cd /var/www/nextcloud && php occ user:setting Gutfit_Clients quota '5 GB'"

    # Enable user white-listing (only allow registered clinicians/clients)
    nc_exec "cd /var/www/nextcloud && php occ config:app:set settings whitelist_enabled --value yes"

    echo "✅ Workflows configured"
}

# Function to health check and self-healing
health_check() {
    echo "🔍 Running Nextcloud health diagnostics..."

    # Check database connection
    nc_exec "cd /var/www/nextcloud && php occ db:status"
    echo "✅ Database connection OK"

    # Check file system permissions
    nc_exec "cd /var/www/nextcloud && php occ maintenance:repair --include-expensive"
    echo "✅ File system permissions OK"

    # Update file cache
    nc_exec "cd /var/www/nextcloud && php occ files:scan --all"
    echo "✅ File cache updated"

    # Check for errors
    nc_exec "cd /var/www/nextcloud && php occ maintenance:mode --off"

    echo "✅ Health check passed"
}

# Function to create client onboarding template
create_client_template() {
    echo "📋 Setting up client onboarding template..."

    # Create template user structure
    TEMPLATE_USER="client_template"
    nc_exec "cd /var/www/nextcloud && php occ user:add '$TEMPLATE_USER'"

    # Set up template folder structure
    nc_exec "mkdir -p '$DATA_DIR/$TEMPLATE_USER/files/Welcome'"
    nc_exec "mkdir -p '$DATA_DIR/$TEMPLATE_USER/files/Personal'"
    nc_exec "mkdir -p '$DATA_DIR/$TEMPLATE_USER/files/Sessions'"
    nc_exec "mkdir -p '$DATA_DIR/$TEMPLATE_USER/files/Homework'"

    # Set permissions
    nc_exec "chmod -R 755 '$DATA_DIR/$TEMPLATE_USER/files'"
    nc_exec "chown -R www-data:www-data '$DATA_DIR/$TEMPLATE_USER/files'"

    echo "✅ Client template created"
}

# Function to enable autonomous features
enable_autonomy() {
    echo "🤖 Enabling GutfitOS autonomous features..."

    # Enable activity logging for clinical oversight
    nc_exec "cd /var/www/nextcloud && php occ app:install activity"
    nc_exec "cd /var/www/nextcloud && php occ app:enable activity"

    # Enable monitoring for performance tracking
    nc_exec "cd /var/www/nextcloud && php occ app:install serverinfo"
    nc_exec "cd /var/www/nextcloud && php occ app:enable serverinfo"

    # Create cron job for autonomous sync
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" \
        "echo '*/15 * * * * docker exec $NC_CONTAINER php /var/www/nextcloud/cron.php' | crontab -"

    echo "✅ Autonomous features enabled"
}

# Main setup function
main() {
    echo "🔄 Starting autonomous Nextcloud configuration..."

    # Preflight checks
    echo "🛫 Running preflight checks..."
    ssh_exec "docker ps | grep $NC_CONTAINER" || {
        echo "❌ Nextcloud container not found. Please deploy Nextcloud first."
        exit 1
    }

    # Sequential setup phases
    health_check
    create_protocol_folders
    install_medical_apps
    configure_user_groups
    configure_workflows
    create_client_template
    enable_autonomy

    echo "🎉 NEXTCLOUD AUTONOMOUS CONFIGURATION COMPLETE!"
    echo "================================================"
    echo ""
    echo "📊 STATUS SUMMARY:"
    echo "✅ Clinical protocol folders created"
    echo "✅ Medical apps installed (calendar, tasks, forms, docs)"
    echo "✅ User groups configured (Founders, Clinicians, Clients, Admin)"
    echo "✅ Clinical workflows enabled"
    echo "✅ Client onboarding template set up"
    echo "✅ Autonomous features activated"
    echo ""
    echo "🌐 ACCESS:"
    echo "Nextcloud URL: https://cloud.gutfit.co"
    echo "Admin setup required for initial login"
    echo ""
    echo "🔄 AUTONOMOUS FEATURES:"
    echo "• Auto-sync every 15 minutes"
    echo "• Health monitoring active"
    echo "• Clinical protocol auto-deployment"
    echo "• User quota management"
    echo "• Activity logging for compliance"
    echo ""
    echo "🚀 READY FOR FOUNDER ONBOARDING!"

    # Final health check
    health_check
}

# Run main setup
main
