#!/bin/bash

echo "🚀 GUTFIT FINAL GITHUB UPLOAD"
echo "=============================="

IP="38.102.126.217"
USER="root"
PASSWORD="m5#nzEzA+o2v"

echo "Executing final GitHub upload and repository creation..."
echo ""

# Step 1: Connect and authenticate with GitHub
echo "Step 1: Authenticating with GitHub CLI..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
cd /config/workspace/gutfit-platform

# Set GitHub CLI to not use browser for automation
export GH_PROMPT_DISABLED=1

# Try to authenticate (may need manual intervention)
echo "Attempting GitHub authentication..."
gh auth login --with-token <<< "$(cat ~/.github_token 2>/dev/null || echo '')" || {
    echo "GitHub authentication requires manual setup."
    echo "Please run: ssh root@38.102.126.217"
    echo "Then: cd /config/workspace/gutfit-platform"
    echo "Then: gh auth login"
    echo "Then: gh repo create gutfit/gutfit-platform --public"
    echo "Then: git push -u origin main"
    exit 1
}

echo "✅ GitHub authenticated"
EOF

if [ $? -ne 0 ]; then
    echo ""
    echo "🔧 MANUAL GITHUB SETUP REQUIRED"
    echo "================================"
    echo ""
    echo "Please execute these commands manually:"
    echo ""
    echo "1. Connect to server:"
    echo "   ssh root@$IP"
    echo "   Password: $PASSWORD"
    echo ""
    echo "2. Navigate to project:"
    echo "   cd /config/workspace/gutfit-platform"
    echo ""
    echo "3. Authenticate GitHub:"
    echo "   gh auth login"
    echo ""
    echo "4. Create repository:"
    echo "   gh repo create gutfit/gutfit-platform --public --description \"Comprehensive wellness platform integrating clinical psychology with biological optimization\""
    echo ""
    echo "5. Push to GitHub:"
    echo "   git remote add origin git@github.com:gutfit/gutfit-platform.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "🔑 SSH KEY FOR GITHUB (copy this):"
    sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'cat ~/.ssh/id_ed25519.pub'
    echo ""
    exit 0
fi

# Step 2: Create repository and push (if automation works)
echo "Step 2: Creating GitHub repository and pushing..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP << 'EOF'
cd /config/workspace/gutfit-platform

# Create repository
gh repo create gutfit/gutfit-platform --public --description "Comprehensive wellness platform integrating clinical psychology with biological optimization"

# Add remote and push
git remote add origin git@github.com:gutfit/gutfit-platform.git
git branch -M main
git push -u origin main

echo "✅ Repository created and pushed to GitHub"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! GitHub repository created!"
    echo "==================================="
    echo ""
    echo "📊 Repository Details:"
    echo "URL: https://github.com/gutfit/gutfit-platform"
    echo "Status: Public repository with complete project upload"
    echo ""
    echo "🌐 Access Your Development Environment:"
    echo "VSCode Browser: http://$IP:8080 (Password: gutfit2025!)"
    echo "SSH Access: ssh root@$IP (Password: $PASSWORD)"
    echo ""
    echo "🔄 Synchronization Active:"
    echo "Auto-sync runs every 15 minutes"
    echo "Manual sync: /config/workspace/sync-gutfit.sh"
    echo ""
    echo "🚀 Your Gutfit platform is now live and ready for development!"
else
    echo ""
    echo "⚠️  Automation completed - manual setup may be required"
    echo "======================================================"
    echo ""
    echo "Please follow the manual steps displayed above."
fi