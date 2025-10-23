#!/bin/bash

echo "🚀 GUTFIT REMOTE SETUP - FASTEST DEPLOYMENT"
echo "=============================================="

# Server Configuration
SERVER="mtl.autho.cloud"
USER="root"
PASSWORD="m5#nzEzA+o2v"
WORKSPACE="/config/workspace"

echo "Step 1: Testing SSH connection..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "echo '✅ SSH connection successful'"

echo "Step 2: Setting up Git and GitHub..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'EOF'
cd /config/workspace

# Update system and install Git
apt update && apt install -y git curl wget

# Configure Git
git config --global user.name "Gutfit Development"
git config --global user.email "dev@gutfit.co"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "gutfit@github.com" -f ~/.ssh/id_ed25519 -N ""

# Display public key for GitHub setup
echo "=== COPY THIS SSH PUBLIC KEY TO GITHUB ==="
cat ~/.ssh/id_ed25519.pub
echo "==========================================="

# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/githubcli.list > /dev/null
apt update && apt install -y gh

echo "✅ Git and GitHub CLI installed"
EOF

echo "Step 3: Create project directory and setup repository..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'EOF'
cd /config/workspace

# Create project directory
mkdir -p gutfit-platform
cd gutfit-platform

# Initialize Git repository
git init
echo "# Gutfit Platform" > README.md
git add README.md
git commit -m "Initial repository setup"

echo "✅ Repository initialized"
EOF

echo "Step 4: Create auto-sync script..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'EOF'
cat > /config/workspace/auto-sync.sh << 'SCRIPT'
#!/bin/bash
cd /config/workspace/gutfit-platform
git add .
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main 2>/dev/null || echo "GitHub remote not configured yet"
echo "Sync completed at $(date)"
SCRIPT

chmod +x /config/workspace/auto-sync.sh
echo "✅ Auto-sync script created"
EOF

echo "Step 5: Setup VSCode browser access..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER << 'EOF'
# Install code-server
curl -fsSL https://code-server.dev/install.sh | sh
systemctl enable --now code-server@root

# Configure code-server
mkdir -p ~/.config/code-server
cat > ~/.config/code-server/config.yaml << CONFIG
bind-addr: 0.0.0.0:8080
auth: password
password: gutfit2025!
cert: false
CONFIG

# Restart with new configuration
systemctl restart code-server@root

# Wait a moment for startup
sleep 5

# Check status
if systemctl is-active --quiet code-server@root; then
    echo "✅ VSCode server is running"
else
    echo "❌ VSCode server failed to start"
fi
EOF

echo ""
echo "🎉 SETUP COMPLETE!"
echo "==================="
echo ""
echo "📋 NEXT STEPS:"
echo "1. Add SSH key to GitHub: (See above public key)"
echo "2. Authenticate GitHub CLI: ssh root@$SERVER 'gh auth login'"
echo "3. Create repository: ssh root@$SERVER 'gh repo create gutfit/gutfit-platform --public'"
echo "4. Upload project files: scp -r /home/ap/Desktop/gutfit-new-start./* root@$SERVER:/config/workspace/gutfit-platform/"
echo "5. Push to GitHub: ssh root@$SERVER 'cd /config/workspace/gutfit-platform && git push -u origin main'"
echo ""
echo "🌐 ACCESS URLs:"
echo "VSCode Browser: http://mtl.autho.cloud:8080 (Password: gutfit2025!)"
echo "EasyPanel Admin: https://mtl.autho.cloud:20443 (User: apadmin@hostether.com, Pass: EthrAuth$$!!11)"
echo ""
echo "🔄 AUTO-SYNC:"
echo "Every 15 minutes: /config/workspace/auto-sync.sh"
echo "Manual sync: ssh root@$SERVER '/config/workspace/auto-sync.sh'"