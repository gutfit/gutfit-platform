#!/bin/bash

# Juicc Brand OS Deployment Script
# This script deploys the complete Juicc Brand OS stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="juicc-brand-os"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy.log"

# Create directories
mkdir -p logs backups output models templates ssl config

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> $LOG_FILE
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> $LOG_FILE
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1" >> $LOG_FILE
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        warning ".env file not found. Creating from template..."
        cp .env.example $ENV_FILE
        warning "Please edit $ENV_FILE with your configuration before continuing."
        exit 1
    fi
    
    log ".env file found"
}

# Create backup of existing data
create_backup() {
    if [ -d "./volumes" ]; then
        info "Creating backup of existing data..."
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p $BACKUP_DIR/$BACKUP_NAME
        
        # Backup PostgreSQL data
        if [ -d "./volumes/postgres_data" ]; then
            cp -r ./volumes/postgres_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        # Backup Redis data
        if [ -d "./volumes/redis_data" ]; then
            cp -r ./volumes/redis_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        # Backup Neo4j data
        if [ -d "./volumes/neo4j_data" ]; then
            cp -r ./volumes/neo4j_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        # Backup Qdrant data
        if [ -d "./volumes/qdrant_data" ]; then
            cp -r ./volumes/qdrant_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build AI Orchestrator
    if [ -d "./juicc-ai-orchestrator" ]; then
        info "Building AI Orchestrator..."
        docker-compose build juicc-ai-orchestrator
    else
        warning "AI Orchestrator directory not found. Skipping build."
    fi
    
    # Build Creative Engine
    if [ -d "./juicc-creative-engine" ]; then
        info "Building Creative Engine..."
        docker-compose build juicc-creative-engine
    else
        warning "Creative Engine directory not found. Skipping build."
    fi
    
    # Build PDF Generator
    if [ -d "./juicc-pdf-generator" ]; then
        info "Building PDF Generator..."
        docker-compose build juicc-pdf-generator
    else
        warning "PDF Generator directory not found. Skipping build."
    fi
    
    # Build Media Publisher
    if [ -d "./juicc-media-publisher" ]; then
        info "Building Media Publisher..."
        docker-compose build juicc-media-publisher
    else
        warning "Media Publisher directory not found. Skipping build."
    fi
    
    log "Docker images built successfully"
}

# Start services
start_services() {
    log "Starting Juicc Brand OS services..."
    
    # Start infrastructure services first
    info "Starting infrastructure services..."
    docker-compose up -d juicc-postgres juicc-redis juicc-qdrant juicc-neo4j
    
    # Wait for infrastructure to be ready
    info "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    info "Starting application services..."
    docker-compose up -d juicc-directus juicc-ai-orchestrator juicc-creative-engine juicc-pdf-generator juicc-media-publisher
    
    # Wait for application services to be ready
    info "Waiting for application services to be ready..."
    sleep 60
    
    # Start monitoring services
    info "Starting monitoring services..."
    docker-compose up -d juicc-prometheus juicc-grafana redis-exporter postgres-exporter
    
    # Start reverse proxy
    info "Starting reverse proxy..."
    docker-compose up -d juicc-nginx
    
    log "All services started successfully"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    services=(
        "juicc-directus:8055"
        "juicc-ai-orchestrator:3001"
        "juicc-creative-engine:3002"
        "juicc-pdf-generator:3003"
        "juicc-media-publisher:3004"
    )
    
    for service in "${services[@]}"; do
        service_name=$(echo $service | cut -d: -f1)
        service_port=$(echo $service | cut -d: -f2)
        
        info "Checking $service_name..."
        
        # Try to connect to the service
        if curl -f -s "http://localhost:$service_port/health" > /dev/null 2>&1; then
            log "$service_name is healthy"
        else
            warning "$service_name is not responding yet. Waiting..."
            sleep 10
            
            # Try again
            if curl -f -s "http://localhost:$service_port/health" > /dev/null 2>&1; then
                log "$service_name is now healthy"
            else
                error "$service_name is still not responding"
            fi
        fi
    done
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for Directus to be ready
    info "Waiting for Directus to be ready..."
    while ! curl -f -s "http://localhost:8055/server/health" > /dev/null 2>&1; do
        info "Waiting for Directus..."
        sleep 5
    done
    
    # Run migrations
    docker-compose exec juicc-directus npx directus database migrate:latest
    
    log "Database migrations completed"
}

# Seed initial data
seed_data() {
    log "Seeding initial data..."
    
    # Check if data is already seeded
    if docker-compose exec juicc-directus npx directus database seed:status | grep -q "already seeded"; then
        info "Data is already seeded"
        return
    fi
    
    # Run seed
    docker-compose exec juicc-directus npx directus database seed:latest
    
    log "Initial data seeded successfully"
}

# Show deployment summary
show_summary() {
    log "Deployment completed successfully!"
    log ""
    log "Juicc Brand OS is now running at:"
    log "  - Directus Admin: http://localhost:8055"
    log "  - Grafana Dashboard: http://localhost:3000"
    log "  - Prometheus: http://localhost:9090"
    log ""
    log "Default credentials:"
    log "  - Directus: admin@juicc.com / juicc123"
    log "  - Grafana: admin / juicc123"
    log ""
    log "To stop the services, run: ./juicc-infra/stop.sh"
    log "To view logs, run: ./juicc-infra/logs.sh"
    log ""
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Juicc Brand OS deployment..."
    
    # Check prerequisites
    check_docker
    check_env_file
    
    # Create backup
    create_backup
    
    # Build images
    build_images
    
    # Start services
    start_services
    
    # Check health
    check_health
    
    # Run migrations
    run_migrations
    
    # Seed data
    seed_data
    
    # Show summary
    show_summary
    
    # Cleanup
    cleanup
    
    log "Juicc Brand OS deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        build_images
        ;;
    start)
        start_services
        ;;
    stop)
        log "Stopping Juicc Brand OS services..."
        docker-compose down
        log "Services stopped"
        ;;
    restart)
        log "Restarting Juicc Brand OS services..."
        docker-compose restart
        log "Services restarted"
        ;;
    logs)
        docker-compose logs -f
        ;;
    health)
        check_health
        ;;
    backup)
        create_backup
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|build|start|stop|restart|logs|health|backup|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  build    - Build Docker images only"
        echo "  start    - Start services only"
        echo "  stop     - Stop services"
        echo "  restart  - Restart services"
        echo "  logs     - Show service logs"
        echo "  health   - Check service health"
        echo "  backup   - Create backup"
        echo "  cleanup  - Clean up unused resources"
        exit 1
        ;;
esac