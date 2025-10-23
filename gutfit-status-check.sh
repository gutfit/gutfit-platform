#!/bin/bash

echo "🔍 GUTFIT DEPLOYMENT STATUS CHECK"
echo "================================="

IP="38.102.126.217"
USER="root"
PASSWORD="m5#nzEzA+o2v"

echo "Checking deployment status..."
echo ""

# Check if VSCode is running
echo "📊 VSCode Server Status:"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'systemctl is-active code-server@root && echo "✅ VSCode is running" || echo "❌ VSCode is not running"'

echo ""

# Check project directory
echo "📁 Project Directory Status:"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'ls -la /config/workspace/gutfit-platform/ | head -10'

echo ""

# Check Git status
echo "🔧 Git Repository Status:"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'cd /config/workspace/gutfit-platform && git log --oneline -n 3'

echo ""

# Check SSH key for GitHub
echo "🔑 SSH Key for GitHub:"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'cat ~/.ssh/id_ed25519.pub'

echo ""

# Check access info
echo "📋 Access Information:"
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$IP 'cat /config/workspace/ACCESS_INFO.md | head -20'

echo ""
echo "🌐 Quick Access Links:"
echo "VSCode Browser: http://$IP:8080 (Password: gutfit2025!)"
echo "SSH: ssh root@$IP (Password: $PASSWORD)"