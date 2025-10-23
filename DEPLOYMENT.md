# Lions Vogue - Deployment Guide

## Overview

Lions Vogue is a full-stack e-commerce platform for clothing sales and event ticket booking with integrated payment processing, QR code ticket generation, and WhatsApp notifications.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + tRPC
- **Database**: MySQL
- **Payment**: Paystack
- **Storage**: S3 (for product images and QR codes)
- **Authentication**: Manus OAuth (with role-based access control)

---

## Features

### Customer Features
✅ Browse clothing products with search and filtering
✅ View event listings (upcoming and past)
✅ Purchase event tickets with Paystack payment
✅ Receive QR code tickets via email
✅ Shopping cart functionality
✅ Mobile-responsive design

### Admin Features
✅ Secure admin panel (accessible only to admin users)
✅ Product management (CRUD operations)
✅ Event management (CRUD operations)
✅ Order tracking and management
✅ WhatsApp integration for order notifications
✅ Settings management (WhatsApp number configuration)

---

## Environment Variables

### Required Variables (Auto-configured)
These are automatically provided by the platform:
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session signing secret
- `OAUTH_SERVER_URL` - Manus OAuth backend
- `VITE_OAUTH_PORTAL_URL` - Manus login portal
- `VITE_APP_ID` - Application ID
- `BUILT_IN_FORGE_API_URL` - Internal API endpoint
- `BUILT_IN_FORGE_API_KEY` - Internal API key

### Required Variables (You Must Add)

#### 1. Paystack Public Key
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```
**How to get:**
1. Sign up at https://paystack.com
2. Go to Dashboard → Settings → API Keys
3. Copy your Public Key (test or live)

#### 2. Application Branding
```
VITE_APP_TITLE=Lions Vogue
VITE_APP_LOGO=/logo.jpg
```

---

## Database Schema

The application uses the following main tables:

### Core Tables
- **users** - User accounts with role-based access (admin/user)
- **categories** - Product categories
- **products** - Clothing products with variants
- **events** - Event information and ticketing
- **orders** - Order records (clothing + events)
- **order_items** - Line items for clothing orders
- **tickets** - Event tickets with QR codes
- **cart_items** - Shopping cart (guest and user)
- **settings** - System configuration (WhatsApp, etc.)

---

## Deployment to Baota Panel

### Step 1: Prepare Your Server
1. Install Baota Panel on your server
2. Install Node.js (v18 or higher)
3. Install MySQL (v8.0 or higher)
4. Install PM2 for process management

### Step 2: Create MySQL Database
```sql
CREATE DATABASE lions_vogue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lions_vogue_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON lions_vogue.* TO 'lions_vogue_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Upload Project Files
1. Upload the entire project to `/www/wwwroot/lions-vogue/`
2. Ensure proper file permissions:
```bash
chown -R www:www /www/wwwroot/lions-vogue/
chmod -R 755 /www/wwwroot/lions-vogue/
```

### Step 4: Install Dependencies
```bash
cd /www/wwwroot/lions-vogue/
pnpm install
```

### Step 5: Configure Environment Variables
Create `.env` file in the project root:
```env
# Database
DATABASE_URL=mysql://lions_vogue_user:your_secure_password@localhost:3306/lions_vogue

# Authentication (from Manus platform)
JWT_SECRET=your_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your_app_id
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=Your Name

# Paystack Payment
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# Branding
VITE_APP_TITLE=Lions Vogue
VITE_APP_LOGO=/logo.jpg

# Storage (from Manus platform)
BUILT_IN_FORGE_API_URL=your_api_url
BUILT_IN_FORGE_API_KEY=your_api_key

# Production
NODE_ENV=production
PORT=3000
```

### Step 6: Initialize Database
```bash
pnpm db:push
```

### Step 7: Build the Application
```bash
pnpm build
```

### Step 8: Start with PM2
```bash
pm2 start npm --name "lions-vogue" -- start
pm2 save
pm2 startup
```

### Step 9: Configure Nginx (in Baota Panel)
1. Go to Website → Add Site
2. Domain: your-domain.com
3. Root directory: `/www/wwwroot/lions-vogue/`
4. Add this Nginx configuration:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

location /logo.jpg {
    alias /www/wwwroot/lions-vogue/client/public/logo.jpg;
}
```

### Step 10: Enable SSL (Recommended)
1. In Baota Panel, go to your site settings
2. Click SSL → Let's Encrypt
3. Apply for free SSL certificate
4. Enable Force HTTPS

---

## First-Time Setup

### 1. Access Admin Panel
1. Visit: `https://your-domain.com/admin`
2. Click "Admin Sign In"
3. Log in with your Manus account
4. You'll be automatically set as admin (first user with OWNER_OPEN_ID)

### 2. Configure WhatsApp Notifications
1. Go to Admin → Settings
2. Enter your WhatsApp number (with country code, e.g., +2348012345678)
3. Click Save
4. Orders will now send notifications to this number

### 3. Add Product Categories
1. Go to Admin → Products
2. Click "Add Product"
3. Create categories (e.g., "Men's Wear", "Women's Wear", "Accessories")

### 4. Add Products
1. Upload product images to a CDN or use direct URLs
2. Fill in product details (name, price, description, stock)
3. Set featured products to appear on homepage
4. Activate products to make them visible

### 5. Add Events
1. Go to Admin → Events
2. Click "Add Event"
3. Fill in event details (name, date, venue, ticket price)
4. Set total tickets and available tickets
5. Upload event image
6. Mark as featured to show on homepage

---

## How It Works

### Event Ticket Purchase Flow
1. Customer browses events at `/events`
2. Clicks on event to view details
3. Fills in personal information (name, email, phone)
4. Selects number of tickets
5. Clicks "Purchase Tickets" → Paystack payment modal opens
6. After successful payment:
   - Order is created in database
   - Tickets are generated with unique QR codes
   - QR codes are uploaded to S3
   - Email is sent to customer with QR codes
   - Admin receives WhatsApp notification with order details

### Product Order Flow
1. Customer browses products at `/shop`
2. Adds items to cart
3. Proceeds to checkout
4. Fills in shipping information
5. Completes Paystack payment
6. Admin receives WhatsApp notification with:
   - Customer details
   - Shipping address
   - Order items
   - Direct WhatsApp link to contact customer

### Admin Order Management
1. Admin logs in at `/admin`
2. Views all orders in Orders section
3. Updates order status (pending → processing → shipped → delivered)
4. Verifies event tickets using QR codes
5. Manages inventory and stock levels

---

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
mysql -u lions_vogue_user -p lions_vogue
```

### PM2 Process Issues
```bash
# View logs
pm2 logs lions-vogue

# Restart application
pm2 restart lions-vogue

# Stop application
pm2 stop lions-vogue
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
pnpm build
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## Maintenance

### Update Application
```bash
cd /www/wwwroot/lions-vogue/
git pull  # if using git
pnpm install
pnpm db:push  # if schema changed
pnpm build
pm2 restart lions-vogue
```

### Backup Database
```bash
mysqldump -u lions_vogue_user -p lions_vogue > backup_$(date +%Y%m%d).sql
```

### Monitor Logs
```bash
pm2 logs lions-vogue --lines 100
```

---

## Security Checklist

- [ ] SSL certificate installed and HTTPS enabled
- [ ] Strong database password set
- [ ] Environment variables secured (not in version control)
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular database backups scheduled
- [ ] PM2 startup script enabled
- [ ] Admin access restricted to authorized users
- [ ] Paystack webhook signature verification enabled

---

## Support

For issues or questions:
1. Check logs: `pm2 logs lions-vogue`
2. Review database schema in `drizzle/schema.ts`
3. Check API endpoints in `server/routers.ts`
4. Verify environment variables in `.env`

---

## Important Notes

1. **Admin Access**: Only users with `role='admin'` can access `/admin` routes
2. **First Admin**: The user with `openId` matching `OWNER_OPEN_ID` is automatically set as admin
3. **Paystack**: Test mode keys (pk_test_) should be used for testing, switch to live keys (pk_live_) for production
4. **WhatsApp**: Order notifications are sent via WhatsApp Web link (customer must have WhatsApp installed)
5. **Email**: Ticket delivery uses the built-in notification system (logs to console in development)
6. **QR Codes**: Generated tickets are stored in S3 and sent via email for event entry verification

---

## Production Checklist

Before going live:
- [ ] Switch Paystack from test to live keys
- [ ] Configure proper email service (currently logs to console)
- [ ] Set up database backup automation
- [ ] Enable error monitoring (e.g., Sentry)
- [ ] Test complete purchase flow (products + events)
- [ ] Verify WhatsApp notifications work
- [ ] Test QR code generation and email delivery
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Create admin user accounts
- [ ] Add initial products and events
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Framework**: React 19 + Node.js + tRPC + MySQL

