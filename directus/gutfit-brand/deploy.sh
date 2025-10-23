#!/bin/bash

# Gutfit Brand OS Deployment Script
# This script deploys the Gutfit-specific version of Juicc Brand OS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="gutfit-brand-os"
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

gutfit() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] GUTFIT: $1${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] GUTFIT: $1" >> $LOG_FILE
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
        if [ -d "./volumes/gutfit_postgres_data" ]; then
            cp -r ./volumes/gutfit_postgres_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        # Backup Redis data
        if [ -d "./volumes/gutfit_redis_data" ]; then
            cp -r ./volumes/gutfit_redis_data $BACKUP_DIR/$BACKUP_NAME/
        fi
        
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Build Docker images
build_images() {
    log "Building Docker images for Gutfit Brand OS..."
    
    # Build AI Orchestrator
    if [ -d "../juicc-ai-orchestrator" ]; then
        info "Building Gutfit AI Orchestrator..."
        docker-compose build gutfit-ai-orchestrator
    else
        warning "AI Orchestrator directory not found. Skipping build."
    fi
    
    # Build Creative Engine
    if [ -d "../juicc-creative-engine" ]; then
        info "Building Gutfit Creative Engine..."
        docker-compose build gutfit-creative-engine
    else
        warning "Creative Engine directory not found. Skipping build."
    fi
    
    # Build PDF Generator
    if [ -d "../juicc-pdf-generator" ]; then
        info "Building Gutfit PDF Generator..."
        docker-compose build gutfit-pdf-generator
    else
        warning "PDF Generator directory not found. Skipping build."
    fi
    
    log "Docker images built successfully"
}

# Start services
start_services() {
    gutfit "Starting Gutfit Brand OS services..."
    
    # Start infrastructure services first
    info "Starting infrastructure services..."
    docker-compose up -d gutfit-postgres gutfit-redis
    
    # Wait for infrastructure to be ready
    info "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    info "Starting application services..."
    docker-compose up -d gutfit-directus gutfit-ai-orchestrator gutfit-creative-engine gutfit-pdf-generator
    
    # Wait for application services to be ready
    info "Waiting for application services to be ready..."
    sleep 60
    
    # Start monitoring services
    info "Starting monitoring services..."
    docker-compose up -d gutfit-prometheus gutfit-grafana
    
    # Start reverse proxy
    info "Starting reverse proxy..."
    docker-compose up -d gutfit-nginx
    
    gutfit "All services started successfully"
}

# Check service health
check_health() {
    gutfit "Checking service health..."
    
    services=(
        "gutfit-directus:8055"
        "gutfit-ai-orchestrator:3001"
        "gutfit-creative-engine:3002"
        "gutfit-pdf-generator:3003"
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
    gutfit "Running database migrations..."
    
    # Wait for Directus to be ready
    info "Waiting for Directus to be ready..."
    while ! curl -f -s "http://localhost:8056/server/health" > /dev/null 2>&1; do
        info "Waiting for Directus..."
        sleep 5
    done
    
    # Run migrations
    docker-compose exec gutfit-directus npx directus database migrate:latest
    
    gutfit "Database migrations completed"
}

# Seed initial Gutfit data
seed_gutfit_data() {
    gutfit "Seeding initial Gutfit data..."
    
    # Check if data is already seeded
    if docker-compose exec gutfit-directus npx directus database seed:status 2>/dev/null | grep -q "already seeded"; then
        info "Gutfit data is already seeded"
        return
    fi
    
    # Create Gutfit brand data
    docker-compose exec gutfit-directus node /directus/scripts/seed-gutfit-data.js
    
    # Run seed
    docker-compose exec gutfit-directus npx directus database seed:latest
    
    gutfit "Initial Gutfit data seeded successfully"
}

# Initialize Gutfit brand book
initialize_brand_book() {
    gutfit "Initializing Gutfit brand book..."
    
    # Wait for services to be fully ready
    sleep 30
    
    # Generate initial brand book
    curl -X POST "http://localhost:8056/gutfit/brand-book/generate" \
         -H "Content-Type: application/json" \
         -d '{"format": "web", "options": {"includeAnalytics": true}}' \
         > /dev/null 2>&1
    
    gutfit "Gutfit brand book initialization completed"
}

# Show deployment summary
show_summary() {
    gutfit "Deployment completed successfully!"
    gutfit ""
    gutfit "🌱 Gutfit Brand OS is now running at:"
    gutfit "  - Directus Admin: http://localhost:8056"
    gutfit "  - Grafana Dashboard: http://localhost:3001"
    gutfit "  - Prometheus: http://localhost:9091"
    gutfit "  - Nginx Proxy: http://localhost:8080"
    gutfit ""
    gutfit "Default credentials:"
    gutfit "  - Directus: admin@gutfit.com / gutfit123"
    gutfit "  - Grafana: admin / gutfit123"
    gutfit ""
    gutfit "🎯 Next Steps:"
    gutfit "  1. Access Directus at http://localhost:8056"
    gutfit "  2. Configure your OpenAI API key"
    gutfit "  3. Generate your first Gutfit brand book"
    gutfit "  4. Explore the AI-powered brand features"
    gutfit ""
    gutfit "To stop the services, run: ./deploy.sh stop"
    gutfit "To view logs, run: ./deploy.sh logs"
    gutfit ""
}

# Cleanup function
cleanup() {
    gutfit "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    gutfit "Cleanup completed"
}

# Generate sample brand book
generate_sample_brand_book() {
    gutfit "Generating sample Gutfit brand book..."
    
    # Wait for AI service to be ready
    info "Waiting for AI service to be ready..."
    sleep 30
    
    # Generate brand book in different formats
    formats=("web" "pdf" "interactive")
    
    for format in "${formats[@]}"; do
        gutfit "Generating $format brand book..."
        
        response=$(curl -s -X POST "http://localhost:8056/gutfit/brand-book/generate" \
                     -H "Content-Type: application/json" \
                     -d "{\"format\": \"$format\", \"options\": {\"includeAnalytics\": true, \"emotionalAdaptations\": true}}")
        
        if echo "$response" | grep -q "success\":true"; then
            gutfit "✅ $format brand book generated successfully"
        else
            warning "⚠️  $format brand book generation failed"
        fi
        
        sleep 10
    done
    
    gutfit "Sample brand book generation completed"
}

# Test brand book generation
test_brand_book_generation() {
    gutfit "Testing brand book generation..."
    
    # Test API endpoint
    response=$(curl -s -X POST "http://localhost:8056/gutfit/brand-book/generate" \
                 -H "Content-Type: application/json" \
                 -d '{"format": "web", "options": {"includeAnalytics": true}}')
    
    if echo "$response" | grep -q "success\":true"; then
        gutfit "✅ Brand book generation test passed"
        return 0
    else
        error "❌ Brand book generation test failed"
        return 1
    fi
}

# Main deployment function
main() {
    gutfit "🌱 Starting Gutfit Brand OS deployment..."
    
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
    seed_gutfit_data
    
    # Initialize brand book
    initialize_brand_book
    
    # Test brand book generation
    if test_brand_book_generation; then
        # Generate sample brand book
        generate_sample_brand_book
    fi
    
    # Show summary
    show_summary
    
    # Cleanup
    cleanup
    
    gutfit "🎉 Gutfit Brand OS deployment completed successfully!"
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
        gutfit "Stopping Gutfit Brand OS services..."
        docker-compose down
        gutfit "Services stopped"
        ;;
    restart)
        gutfit "Restarting Gutfit Brand OS services..."
        docker-compose restart
        gutfit "Services restarted"
        ;;
    logs)
        docker-compose logs -f
        ;;
    health)
        check_health
        ;;
    test)
        test_brand_book_generation
        ;;
    sample)
        generate_sample_brand_book
        ;;
    backup)
        create_backup
        ;;
    cleanup)
        cleanup
        ;;
    beta)
        gutfit "🚀 Deploying Gutfit Brand OS Beta V1.0..."
        main
        gutfit ""
        gutfit "🎯 Beta V1.0 Features:"
        gutfit "  ✅ Gutfit brand book generation"
        gutfit "  ✅ AI-powered content creation"
        gutfit "  ✅ Scientific foundation section"
        gutfit "  ✅ Health-specific brand guidelines"
        gutfit "  ✅ Real-time analytics dashboard"
        gutfit ""
        gutfit "🌟 Ready for client demonstration!"
        ;;
    *)
        echo "Usage: $0 {deploy|build|start|stop|restart|logs|health|test|sample|backup|cleanup|beta}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  build    - Build Docker images only"
        echo "  start    - Start services only"
        echo "  stop     - Stop services"
        echo "  restart  - Restart services"
        echo "  logs     - Show service logs"
        echo "  health   - Check service health"
        echo "  test     - Test brand book generation"
        echo "  sample   - Generate sample brand book"
        echo "  backup   - Create backup"
        echo "  cleanup  - Clean up unused resources"
        echo "  beta     - Deploy Beta V1.0 for client"
        exit 1
        ;;
esac