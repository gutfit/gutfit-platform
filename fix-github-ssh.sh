#!/bin/bash

echo "🔧 FIXING GITHUB SSH CONNECTION"
echo "==============================="

# Configuration
SERVER="mtl.autho.cloud"
USER="root"
PASSWORD="m5#nzEzA+o2v"

echo "Step 1: Adding GitHub to known hosts..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts"

echo "Step 2: Testing GitHub connection..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "ssh -T git@github.com"

echo "Step 3: Testing git push..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $USER@$SERVER "cd /config/workspace/gutfit-project && git push origin main"

echo "✅ GitHub SSH connection fixed!"
echo "============================="
echo "Your auto-sync should now work properly."