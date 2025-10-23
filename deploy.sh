#!/bin/bash

# Lions Vogue Deployment Script for Baota Panel
# This script automates the deployment process

echo "================================"
echo "Lions Vogue Deployment Script"
echo "================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo bash deploy.sh"
    exit 1
fi

# Set project directory
PROJECT_DIR="/www/wwwroot/lions-vogue"

echo "Step 1: Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo ""
echo "Step 2: Installing dependencies..."
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

pnpm install

echo ""
echo "Step 3: Setting up environment..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=mysql://lions_vogue_user:YOUR_PASSWORD@localhost:3306/lions_vogue

# JWT Secret
JWT_SECRET=change_this_to_a_long_random_string

# OAuth Configuration
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Admin

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Branding
VITE_APP_TITLE=Lions Vogue
VITE_APP_LOGO=/logo.png

# Built-in Services
BUILT_IN_FORGE_API_URL=your_api_url
BUILT_IN_FORGE_API_KEY=your_api_key

# Production
NODE_ENV=production
PORT=3000
EOF
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your actual values!"
    echo "   Run: nano $PROJECT_DIR/.env"
    echo ""
    read -p "Press Enter after you've edited the .env file..."
fi

echo ""
echo "Step 4: Initializing database..."
pnpm db:push

echo ""
echo "Step 5: Building application..."
pnpm build

echo ""
echo "Step 6: Setting up PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
pm2 stop lions-vogue 2>/dev/null || true
pm2 delete lions-vogue 2>/dev/null || true

# Start new process
pm2 start npm --name "lions-vogue" -- start
pm2 save
pm2 startup

echo ""
echo "Step 7: Setting permissions..."
chown -R www:www $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "Your website should now be running on port 3000"
echo ""
echo "Next steps:"
echo "1. Configure Nginx reverse proxy in Baota Panel"
echo "2. Visit http://YOUR_SERVER_IP to see your website"
echo "3. Visit http://YOUR_SERVER_IP/admin to access admin panel"
echo ""
echo "Useful commands:"
echo "  pm2 logs lions-vogue    - View application logs"
echo "  pm2 restart lions-vogue - Restart application"
echo "  pm2 status              - Check application status"
echo ""

