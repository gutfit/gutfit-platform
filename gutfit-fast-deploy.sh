#!/bin/bash

echo "🚀 GUTFIT FASTEST DEPLOYMENT"
echo "==============================="

# Configuration
IP="38.102.126.217"
USER="root"
PASSWORD="m5#nzEzA+o2v"
EASYPANEL_API="2aa0060ee46ce79b71da32a860ea602ad4bcbc8371625c28684cec8bf40c60fc"
EASYPANEL_USER="apadmin@hostether.com"
EASYPANEL_PASS="EthrAuth$$!!11"

echo "📍 Using IP: $IP"
echo ""

# Step 1: Test connection and setup basic environment
echo "Step 1: Testing SSH connection and installing required packages..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'apt update && apt install -y git curl wget sshpass -y'

echo "✅ Basic packages installed"
echo ""

# Step 2: Setup Git and GitHub
echo "Step 2: Setting up Git and generating SSH key..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
git config --global user.name "Gutfit Development"
git config --global user.email "dev@gutfit.co"
ssh-keygen -t ed25519 -C "gutfit@github.com" -f ~/.ssh/id_ed25519 -N ""
echo "=== SSH PUBLIC KEY FOR GITHUB ==="
cat ~/.ssh/id_ed25519.pub
echo "=================================="
EOF

echo "✅ Git configured and SSH key generated"
echo ""

# Step 3: Install GitHub CLI
echo "Step 3: Installing GitHub CLI..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/githubcli.list > /dev/null
apt update && apt install -y gh
EOF

echo "✅ GitHub CLI installed"
echo ""

# Step 4: Create project structure
echo "Step 4: Creating project structure..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
mkdir -p /config/workspace/gutfit-platform
cd /config/workspace/gutfit-platform
git init
echo "# Gutfit Platform - Clinical Psychology & Biological Optimization" > README.md
echo "" >> README.md
echo "## Overview" >> README.md
echo "Comprehensive wellness platform integrating clinical psychology expertise with biological optimization technologies." >> README.md
echo "" >> README.md
echo "## Components" >> README.md
echo "- Executive Documentation Suite (100% Complete)" >> README.md
echo "- Technical Infrastructure (75% Complete)" >> README.md
echo "- MCP Development (80% Complete)" >> README.md
echo "- Clinical Validation (Ready for Launch)" >> README.md
git add README.md
git commit -m "Initial repository setup - Gutfit platform foundation"
EOF

echo "✅ Project structure created"
echo ""

# Step 5: Setup VSCode browser access
echo "Step 5: Installing VSCode browser access..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
curl -fsSL https://code-server.dev/install.sh | sh
systemctl enable --now code-server@root
mkdir -p ~/.config/code-server
cat > ~/.config/code-server/config.yaml << CONFIG
bind-addr: 0.0.0.0:8080
auth: password
password: gutfit2025!
cert: false
CONFIG
systemctl restart code-server@root
sleep 3
systemctl status code-server@root --no-pager -l
EOF

echo "✅ VSCode browser access configured"
echo ""

# Step 6: Create auto-sync script
echo "Step 6: Creating auto-sync script..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
cat > /config/workspace/sync-gutfit.sh << 'SYNC'
#!/bin/bash
cd /config/workspace/gutfit-platform
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
if git remote get-url origin >/dev/null 2>&1; then
    git push origin main
else
    echo "GitHub remote not configured yet"
fi
echo "Sync completed at $(date)"
SYNC
chmod +x /config/workspace/sync-gutfit.sh
(crontab -l 2>/dev/null; echo "*/15 * * * * /config/workspace/sync-gutfit.sh >> /config/workspace/sync.log 2>&1") | crontab -
EOF

echo "✅ Auto-sync script created"
echo ""

# Step 7: Upload current project files
echo "Step 7: Uploading current project files..."
mkdir -p /tmp/gutfit-upload
cp -r * /tmp/gutfit-upload/ 2>/dev/null || true
cd /tmp/gutfit-upload

# Create a compressed archive for faster upload
tar -czf gutfit-project.tar.gz --exclude='.git' --exclude='node_modules' --exclude='*.log' .
scp -o StrictHostKeyChecking=no gutfit-project.tar.gz $USER@$IP:/config/workspace/

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
cd /config/workspace
tar -xzf gutfit-project.tar.gz -C gutfit-platform/
cd gutfit-platform
git add .
git commit -m "Project upload - comprehensive documentation and technical foundation

📋 Executive Documentation Suite (100% Complete):
- Investor Executive Summary with $300B+ market opportunity
- Clinical Evidence Summary with evidence-based protocols  
- Market Analysis Report with competitive positioning
- Founder Operational Roadmap (24-month implementation)
- Partnership Strategy Guide with ecosystem development

🏗️ Technical Infrastructure (75% Complete):
- PayloadCMS, Nextcloud (GutfitOS), Moodle, AnythingLLM operational
- MCP server 80% complete with TypeScript framework
- Brand system 60% complete with Directus configuration
- Authentik integration pending (critical blocker)

💰 Investment Opportunity:
- Phase 1 funding: $500K for platform completion
- Initial cohort capacity: 15-20 clients ($37K-$50K revenue)
- Year 1 projections: $150K-$250K revenue
- 5-year ROI potential: 8-12x"
rm /config/workspace/gutfit-project.tar.gz
EOF

echo "✅ Project files uploaded"
echo ""

# Step 8: Create access information file
echo "Step 8: Creating access information..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
cat > /config/workspace/ACCESS_INFO.md << 'INFO'
# GUTFIT PROJECT ACCESS INFORMATION

## 🌐 Access URLs
- **VSCode Browser**: http://38.102.126.217:8080
- **EasyPanel Admin**: https://mtl.autho.cloud:20443

## 🔐 Credentials
- **SSH**: ssh root@38.102.126.217 (Password: m5#nzEzA+o2v)
- **VSCode**: Password: gutfit2025!
- **EasyPanel**: User: apadmin@hostether.com, Password: EthrAuth$$!!11

## 📁 Project Location
- **Remote Path**: /config/workspace/gutfit-platform
- **GitHub Repository**: To be created with 'gutfit' account

## 🔄 Synchronization
- **Auto-Sync**: Every 15 minutes via cron job
- **Manual Sync**: /config/workspace/sync-gutfit.sh
- **Sync Log**: /config/workspace/sync.log

## 📋 Next Steps
1. Add SSH key to GitHub account (see SSH public key above)
2. Authenticate GitHub CLI: gh auth login
3. Create repository: gh repo create gutfit/gutfit-platform --public
4. Push to GitHub: git push -u origin main
5. Begin development work in persistent environment
INFO

echo "✅ Access information created"
EOF

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "📊 SUMMARY:"
echo "✅ Remote server configured with Git and GitHub CLI"
echo "✅ Project uploaded to /config/workspace/gutfit-platform"
echo "✅ VSCode browser access enabled"
echo "✅ Auto-sync configured (every 15 minutes)"
echo "✅ SSH key generated for GitHub integration"
echo ""
echo "🌐 IMMEDIATE ACCESS:"
echo "VSCode Browser: http://38.102.126.217:8080 (Password: gutfit2025!)"
echo "SSH Access: ssh root@38.102.126.217 (Password: m5#nzEzA+o2v)"
echo ""
echo "🔑 SSH PUBLIC KEY (add to GitHub):"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'cat ~/.ssh/id_ed25519.pub'
echo ""
echo "📋 FINAL STEPS:"
echo "1. Add the SSH key above to your GitHub 'gutfit' account"
echo "2. SSH to server: ssh root@38.102.126.217"
echo "3. Authenticate GitHub: gh auth login"
echo "4. Create repository: gh repo create gutfit/gutfit-platform --public"
echo "5. Push to GitHub: cd /config/workspace/gutfit-platform && git push -u origin main"
echo ""
echo "🚀 Your persistent development environment is ready!"