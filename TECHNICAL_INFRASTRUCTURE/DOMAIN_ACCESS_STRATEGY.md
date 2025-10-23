# 🌐 Gutfit Platform Domain Access Strategy

**Purpose**: Professional domain-based access configuration for all Gutfit services
**Date**: October 23, 2025
**Status**: Critical Correction Required
**Impact**: Professional Presentation & Security

## 🚨 CRITICAL ISSUE IDENTIFIED

### **The Problem: IP Address Exposure**

You're absolutely correct - **NEVER publish services to raw IP addresses**. This creates:

- **Unprofessional Appearance**: Looks like a development project, not enterprise platform
- **Security Vulnerabilities**: IP addresses expose infrastructure details
- **Trust Issues**: Users expect professional domain names
- **SEO Problems**: IP addresses cannot be indexed or ranked
- **SSL Certificate Issues**: Professional certificates require domain names

## 🎯 Professional Domain Architecture

### **Domain Structure Design**

```
gutfit.co                    # Primary domain
├── cloud.gutfit.co          # Nextcloud (GutfitOS) - primary user interface
├── auth.gutfit.co           # Authentik authentication service
├── learn.gutfit.co          # Moodle learning management
├── brand.gutfit.co          # Directus brand management
├── ai.gutfit.co            # AnythingLLM AI services
├── api.gutfit.co            # API gateway and services
├── dashboard.gutfit.co      # Founder dashboard
├── docs.gutfit.co           # Documentation and guides
└── app.gutfit.co           # Mobile applications
```

### **SSL Certificate Strategy**

- **Wildcard Certificate**: `*.gutfit.co` for all subdomains
- **Let's Encrypt**: Free, automated certificate renewal
- **Security Headers**: HSTS, CSP, and other security configurations
- **Certificate Monitoring**: Automated expiration alerts

## 🔧 Implementation Plan

### **Phase 1: Domain Configuration (Immediate)**

1. **DNS Setup**: Configure all subdomains to point to appropriate services
2. **SSL Certificates**: Install wildcard SSL certificate
3. **Service Configuration**: Update all services to use domain names
4. **Testing**: Verify all services accessible via domains

### **Phase 2: Content Updates (Same Day)**

1. **Documentation Updates**: Replace all IP references with domains
2. **Configuration Files**: Update all service configurations
3. **User Communication**: Update all user-facing materials
4. **Marketing Materials**: Update all promotional content

### **Phase 3: Security Hardening (Next 24 Hours)**

1. **Security Headers**: Implement HSTS, CSP, and other headers
2. **Rate Limiting**: Configure appropriate rate limits
3. **Monitoring**: Set up security monitoring and alerts
4. **Backup**: Ensure all configurations are backed up

## 📋 Service Configuration Details

### **Nextcloud (GutfitOS) - cloud.gutfit.co**

```bash
# Nextcloud Configuration
occ config:system:set overwrite.cli.url --value="https://cloud.gutfit.co"
occ config:system:set trusted_domains 1 --value="cloud.gutfit.co"
occ config:system:set force_ssl --value="true"
occ config:system:set htaccess.RewriteBase --value="/"

# SSL Configuration
occ config:system:set ssl.certificate --value="/etc/ssl/certs/cloud.gutfit.co.crt"
occ config:system:set ssl.private_key --value="/etc/ssl/private/cloud.gutfit.co.key"
```

### **Authentik - auth.gutfit.co**

```yaml
# Authentik Configuration
authentik:
  server_name: "auth.gutfit.co"
  ssl:
    certificate: "/etc/ssl/certs/auth.gutfit.co.crt"
    key: "/etc/ssl/private/auth.gutfit.co.key"

# Application Configuration
applications:
  - name: "Nextcloud"
    slug: "nextcloud"
    redirect_uris:
      - "https://cloud.gutfit.co/apps/oidc/redirect"
```

### **AnythingLLM - ai.gutfit.co**

```javascript
// AnythingLLM Configuration
const config = {
  domain: "ai.gutfit.co",
  ssl: {
    cert: "/etc/ssl/certs/ai.gutfit.co.crt",
    key: "/etc/ssl/private/ai.gutfit.co.key",
  },
  endpoints: {
    api: "https://ai.gutfit.co/api",
    chat: "https://ai.gutfit.co/chat",
  },
};
```

### **VSCode Server - dashboard.gutfit.co**

```yaml
# Code-Server Configuration
bind-addr: "0.0.0.0:8080"
auth: "password"
password: "gutfit2025!"
cert: "/etc/ssl/certs/dashboard.gutfit.co.crt"
cert-key: "/etc/ssl/private/dashboard.gutfit.co.key"
```

## 🔄 Automated Domain Setup Script

### **Complete Domain Configuration Script**

```bash
#!/bin/bash
# gutfit-domain-setup.sh

echo "🌐 GUTFIT DOMAIN CONFIGURATION"
echo "==============================="

# Configuration
DOMAIN="gutfit.co"
EMAIL="admin@gutfit.co"
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
SSL_DIR="/etc/ssl/certs"

# Subdomains to configure
SUBDOMAINS=(
    "cloud"
    "auth"
    "learn"
    "brand"
    "ai"
    "api"
    "dashboard"
    "docs"
    "app"
)

echo "Step 1: Setting up DNS and SSL certificates..."

# Install Certbot for SSL certificates
apt update && apt install -y certbot python3-certbot-nginx

# Configure each subdomain
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "Configuring ${subdomain}.${DOMAIN}..."

    # Create Nginx configuration
    cat > ${NGINX_CONFIG_DIR}/${subdomain}.${DOMAIN} << EOF
server {
    listen 80;
    server_name ${subdomain}.${DOMAIN};

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${subdomain}.${DOMAIN};

    ssl_certificate ${SSL_DIR}/${subdomain}.${DOMAIN}.crt;
    ssl_certificate_key ${SSL_DIR}/private/${subdomain}.${DOMAIN}.key;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Service-specific configuration will be added here
}
EOF

    # Enable site
    ln -sf ${NGINX_CONFIG_DIR}/${subdomain}.${DOMAIN} /etc/nginx/sites-enabled/

    # Request SSL certificate
    certbot --nginx -d ${subdomain}.${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive
done

# Reload Nginx
systemctl reload nginx

echo "Step 2: Configuring services with new domains..."

# Update Nextcloud configuration
docker exec nextcloud occ config:system:set overwrite.cli.url --value="https://cloud.${DOMAIN}"

# Update Authentik configuration
# [Authentik update commands]

# Update AnythingLLM configuration
# [AnythingLLM update commands]

echo "Step 3: Testing domain access..."

# Test each domain
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "Testing https://${subdomain}.${DOMAIN}..."
    curl -s -o /dev/null -w "%{http_code}" https://${subdomain}.${DOMAIN}
    echo ""
done

echo "✅ DOMAIN CONFIGURATION COMPLETE!"
echo "================================="
echo "Access URLs:"
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "- ${subdomain}: https://${subdomain}.${DOMAIN}"
done
```

## 📱 Updated Founder Access Information

### **Professional Domain Access**

| Service                  | URL                         | Status                  |
| ------------------------ | --------------------------- | ----------------------- |
| **Nextcloud (GutfitOS)** | https://cloud.gutfit.co     | Primary Interface       |
| **VSCode Dashboard**     | https://dashboard.gutfit.co | Development Environment |
| **Authentik Admin**      | https://auth.gutfit.co      | Authentication Service  |
| **Moodle Learning**      | https://learn.gutfit.co     | Education Platform      |
| **Brand Management**     | https://brand.gutfit.co     | Asset Management        |
| **AI Services**          | https://ai.gutfit.co        | AI Assistant Platform   |
| **API Gateway**          | https://api.gutfit.co       | API Services            |
| **Documentation**        | https://docs.gutfit.co      | Help & Guides           |
| **Mobile Apps**          | https://app.gutfit.co       | Mobile Applications     |

### **Updated Credentials**

- **VSCode Dashboard**: Password: `gutfit2025!`
- **Nextcloud Admin**: (configured during setup)
- **Authentik Admin**: (configured during setup)
- **Service Access**: Single sign-on through Authentik

## 🔒 Security Enhancements

### **SSL/TLS Configuration**

```nginx
# Security Headers Configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self';" always;
```

### **Rate Limiting**

```nginx
# Rate Limiting Configuration
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

server {
    limit_req zone=api burst=20 nodelay;
    limit_req zone=login burst=5 nodelay;
}
```

## 📊 Monitoring & Validation

### **SSL Certificate Monitoring**

```bash
# SSL Certificate Monitoring Script
#!/bin/bash
DOMAIN="gutfit.co"

# Check SSL certificate expiration
for subdomain in cloud auth learn brand ai api dashboard docs app; do
    expiry_date=$(echo | openssl s_client -servername ${subdomain}.${DOMAIN} -connect ${subdomain}.${DOMAIN}:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    expiry_epoch=$(date -d "$expiry_date" +%s)
    current_epoch=$(date +%s)
    days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))

    if [ $days_until_expiry -lt 30 ]; then
        echo "WARNING: ${subdomain}.${DOMAIN} SSL certificate expires in $days_until_expiry days"
    fi
done
```

### **Domain Access Testing**

```bash
# Domain Access Testing Script
#!/bin/bash
DOMAIN="gutfit.co"

echo "Testing domain access..."
for subdomain in cloud auth learn brand ai api dashboard docs app; do
    echo -n "${subdomain}.${DOMAIN}: "
    if curl -s --connect-timeout 5 "https://${subdomain}.${DOMAIN}" > /dev/null; then
        echo "✅ ACCESSIBLE"
    else
        echo "❌ NOT ACCESSIBLE"
    fi
done
```

## 🎯 Updated Documentation Strategy

### **Professional References**

- **All IP addresses removed** from documentation
- **Domain-based URLs** throughout all materials
- **Professional language** and presentation
- **Security best practices** emphasized

### **User Communication**

- **Professional email addresses**: name@gutfit.co
- **Domain-based branding**: Consistent across all touchpoints
- **Secure communication**: SSL/TLS for all interactions
- **Professional image**: Enterprise-grade presentation

## 🚀 Immediate Action Required

### **Critical Priority (Next 2 Hours)**

1. **Execute Domain Setup**: Run the domain configuration script
2. **Update Service Configurations**: Modify all services to use domains
3. **Test All Domains**: Verify SSL certificates and access
4. **Update Documentation**: Replace all IP references with domains

### **High Priority (Next 6 Hours)**

1. **Security Hardening**: Implement security headers and rate limiting
2. **Monitoring Setup**: Configure SSL and domain monitoring
3. **User Communication**: Update all user-facing materials
4. **Backup Configuration**: Ensure all changes are backed up

## 🏆 Expected Outcomes

### **Professional Enhancement**

- **Trust Improvement**: Professional domain names increase user trust
- **Security Enhancement**: SSL certificates protect all communications
- **SEO Benefits**: Search engines can index and rank content
- **Brand Consistency**: Professional image across all touchpoints

### **Technical Benefits**

- **Scalability**: Domain-based architecture supports growth
- **Flexibility**: Easy to add new subdomains and services
- **Maintenance**: Centralized SSL certificate management
- **Monitoring**: Professional monitoring and alerting

---

## 🎯 Conclusion

This domain-based access strategy transforms the Gutfit platform from a development project into a **professional, enterprise-grade platform** that will impress users, investors, and partners.

**Professional domains are not just technical requirements—they're essential for building trust, credibility, and market leadership.**

---

_Implementation Date_: October 23, 2025
_Status_: Critical Correction Required
_Priority_: Immediate Implementation
_Impact_: Professional Presentation & Security Enhancement
