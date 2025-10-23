#!/bin/bash

# Lions Vogue Quick Deployment Script
# Run this script on your server after uploading the files

set -e  # Exit on error

echo "🦁 Lions Vogue Deployment Script"
echo "================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root or with sudo"
  exit 1
fi

# Variables
DB_NAME="lions_vogue"
DB_USER="lions_vogue_user"
DB_PASS="bigmarvandlions"
SITE_DIR="/www/wwwroot/lionsvogue"
DOMAIN="lionsvogue.com"

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Install Node.js and pnpm if not installed
echo "📦 Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "✅ Node.js version: $(node -v)"

if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
echo "✅ pnpm version: $(pnpm -v)"
echo ""

# Step 2: Install PM2
echo "📦 Step 2: Checking PM2 installation..."
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi
echo "✅ PM2 installed"
echo ""

# Step 3: Create MySQL database
echo "🗄️  Step 3: Setting up MySQL database..."
read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASS
echo ""

mysql -uroot -p"$MYSQL_ROOT_PASS" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ Database created: $DB_NAME"
echo ""

# Step 4: Install dependencies
echo "📦 Step 4: Installing project dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Configure environment
echo "⚙️  Step 5: Configuring environment..."
cat > .env <<EOF
DATABASE_URL=mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME
NODE_ENV=production
PORT=3000
SITE_URL=https://$DOMAIN
ADMIN_EMAIL=Lionsvogue@gmail.com
EOF
echo "✅ Environment configured"
echo ""

# Step 6: Initialize database
echo "🗃️  Step 6: Initializing database schema..."
pnpm db:push
echo "✅ Database schema created"
echo ""

# Step 7: Insert initial settings
echo "📝 Step 7: Inserting initial settings..."
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
INSERT INTO settings (\`key\`, value, description) 
VALUES 
('admin_email', 'Lionsvogue@gmail.com', 'Admin email for order confirmations'),
('whatsapp_number', '2348137407513', 'Admin WhatsApp for order notifications'),
('support_email', 'Lionsvogue@gmail.com', 'Customer support email'),
('support_whatsapp', '2348137407513', 'Customer support WhatsApp'),
('support_instagram', 'https://www.instagram.com/lionsvogue', 'Instagram profile URL'),
('support_tiktok', 'https://www.tiktok.com/@lionsvogue?_t=ZS-90mrHerruNj&_r=1', 'TikTok profile URL')
ON DUPLICATE KEY UPDATE \`key\`=\`key\`;
EOF
echo "✅ Initial settings inserted"
echo ""

# Step 8: Build application
echo "🏗️  Step 8: Building application..."
pnpm build
echo "✅ Application built"
echo ""

# Step 9: Start with PM2
echo "🚀 Step 9: Starting application with PM2..."
pm2 delete lions-vogue 2>/dev/null || true
pm2 start dist/index.js --name "lions-vogue"
pm2 save
pm2 startup
echo "✅ Application started"
echo ""

# Step 10: Show status
echo "📊 Application Status:"
pm2 status
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "Your Lions Vogue website should now be running on port 3000"
echo "Configure Nginx reverse proxy to point $DOMAIN to http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs lions-vogue    - View application logs"
echo "  pm2 restart lions-vogue - Restart application"
echo ""
echo "Visit: https://$DOMAIN"

