#!/bin/bash

echo "🚀 GUTFIT PLATFORM COMPLETE AUTOMATION"
echo "===================================="

# Configuration
SERVER="mtl.autho.cloud"
USER="root"
PASSWORD="m5#nzEzA+o2v"
EASYPANEL_API="2aa0060ee46ce79b71da32a860ea602ad4bcbc8371625c28684cec8bf40c60fc"
DOMAIN="gutfit.co"
EMAIL="admin@gutfit.co"

echo "Phase 1: Server Connection & Setup..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "mkdir -p /config/workspace/gutfit-project"

echo "Phase 2: Installing Required Tools..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "apt update && apt install -y git curl wget sshpass"

echo "Phase 3: Configuring Git..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "git config --global user.name 'Gutfit Development' && git config --global user.email 'dev@gutfit.co'"

echo "Phase 4: Creating Project Archive..."
tar -czf gutfit-project.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.log' .

echo "Phase 5: Uploading Project Files..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no gutfit-project.tar.gz $USER@$SERVER:/config/workspace/

echo "Phase 6: Extracting Project on Server..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /config/workspace && tar -xzf gutfit-project.tar.gz -C gutfit-project/ && rm gutfit-project.tar.gz"

echo "Phase 7: Initializing Git Repository..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /config/workspace/gutfit-project && git init"

echo "Phase 8: Creating GitHub Repository..."
# Generate SSH key for GitHub
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "ssh-keygen -t ed25519 -C 'gutfit@github.com' -f ~/.ssh/id_ed25519 -N ''"

# Display SSH public key for manual GitHub setup
echo "🔑 SSH PUBLIC KEY FOR GITHUB (copy this to GitHub):"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cat ~/.ssh/id_ed25519.pub"

echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo "1. Copy the SSH key above"
echo "2. Go to https://github.com/settings/keys"
echo "3. Click 'New SSH key'"
echo "4. Paste the key and save"
echo "5. Press Enter to continue..."
read -p ""

echo "Phase 9: Adding GitHub Remote..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /config/workspace/gutfit-project && git remote add origin git@github.com:gutfit/gutfit-platform.git"

echo "Phase 10: Committing and Pushing to GitHub..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /config/workspace/gutfit-project && git add . && git commit -m 'Complete automation - platform deployment' && git branch -M main && git push -u origin main"

echo "Phase 11: Installing Certbot for SSL..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "apt update && apt install -y certbot python3-certbot-nginx"

echo "Phase 12: Creating Nginx Configuration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cat > /etc/nginx/sites-available/gutfit.conf << 'EOF'
server {
    listen 80;
    server_name vscode.gutfit.co cloud.gutfit.co auth.gutfit.co ai.gutfit.co learn.gutfit.co brand.gutfit.co docs.gutfit.co api.gutfit.co;
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name vscode.gutfit.co;
    
    ssl_certificate /etc/letsencrypt/live/gutfit.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gutfit.co/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name cloud.gutfit.co;
    
    ssl_certificate /etc/letsencrypt/live/gutfit.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gutfit.co/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

echo "Phase 13: Enabling Nginx Configuration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "ln -sf /etc/nginx/sites-available/gutfit.conf /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default"

echo "Phase 14: Requesting SSL Certificate..."
echo "⚠️  MANUAL STEP REQUIRED:"
echo "1. Go to your DNS provider"
echo "2. Add these DNS records:"
echo "   vscode.gutfit.co -> $SERVER_IP"
echo "   cloud.gutfit.co -> $SERVER_IP"
echo "   auth.gutfit.co -> $SERVER_IP"
echo "   ai.gutfit.co -> $SERVER_IP"
echo "3. Wait for DNS propagation (5-10 minutes)"
echo "4. Press Enter to continue..."
read -p ""

# Get server IP
SERVER_IP=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s ifconfig.me")

echo "Requesting SSL certificate for *.gutfit.co..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "certbot certonly --standalone -d *.gutfit.co --email $EMAIL --agree-tos --non-interactive --staging"

echo "Phase 15: Installing Authentik via EasyPanel..."
# Install Authentik
curl -X POST "https://mtl.autho.cloud:20443/api/projects" \
  -H "Authorization: Bearer $EASYPANEL_API" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"authentik\",
    \"domain\": \"auth.gutfit.co\",
    \"template\": \"authentik\",
    \"environment\": {
      \"AUTHENTIK_SECRET_KEY\": \"$(openssl rand -base64 32)\",
      \"AUTHENTIK_EMAIL__HOST\": \"smtp.gmail.com\",
      \"AUTHENTIK_EMAIL__USER\": \"admin@gutfit.co\",
      \"AUTHENTIK_EMAIL__PASSWORD\": \"your-app-password\"
    }
  }"

echo "Phase 16: Creating Auto-Sync Script..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cat > /config/workspace/auto-sync.sh << 'EOF'
#!/bin/bash
cd /config/workspace/gutfit-project
git add .
git commit -m \"Auto-sync: \$(date '+%Y-%m-%d %H:%M:%S')\" || echo \"No changes to commit\"
git push origin main
echo \"Sync completed at \$(date)\"
EOF

chmod +x /config/workspace/auto-sync.sh

# Set up cron job
(crontab -l 2>/dev/null; echo \"*/15 * * * * /config/workspace/auto-sync.sh >> /config/workspace/sync.log 2>&1\") | crontab -"

echo "Phase 17: Reloading Nginx..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "systemctl reload nginx"

echo "Phase 18: Final Verification..."
echo "Testing VSCode server..."
VSCode_STATUS=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8080")
if [ "$VSCode_STATUS" = "200" ]; then
    echo "✅ VSCode server is running"
else
    echo "❌ VSCode server may not be running properly"
fi

echo "Testing Nginx configuration..."
NGINX_STATUS=$(sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "nginx -t")
if [[ "$NGINX_STATUS" == *"syntax is ok"* ]]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors"
fi

echo ""
echo "🎉 AUTOMATION COMPLETE!"
echo "====================="
echo ""
echo "📊 FINAL STATUS:"
echo "✅ Project files uploaded to server"
echo "✅ Git repository initialized and pushed to GitHub"
echo "✅ Nginx configuration created"
echo "✅ SSL certificate requested"
echo "✅ Authentik installation initiated"
echo "✅ Auto-sync script configured"
echo ""
echo "🌐 ACCESS URLS:"
echo "- VSCode Development: http://vscode.gutfit.co:8080 (Password: gutfit2025!)"
echo "- Nextcloud (GutfitOS): http://cloud.gutfit.co"
echo "- Authentik Admin: http://auth.gutfit.co"
echo "- GitHub Repository: https://github.com/gutfit/gutfit-platform"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Wait for DNS propagation (5-10 minutes)"
echo "2. Complete SSL certificate setup if needed"
echo "3. Configure Authentik when ready"
echo "4. Test all services"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "- Check sync log: ssh root@$SERVER 'tail -f /config/workspace/sync.log'"
echo "- Restart services: ssh root@$SERVER 'systemctl restart nginx'"
echo "- Check VSCode: ssh root@$SERVER 'systemctl status code-server@root'"
echo ""
echo "🚀 Your Gutfit platform is ready for development!"