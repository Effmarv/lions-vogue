# Lions Vogue - Baota Panel Deployment Guide

## Prerequisites
- Baota Panel installed and running
- Node.js 18+ installed via Baota Panel
- MySQL 8.0+ installed via Baota Panel
- PM2 installed for process management
- Server with at least 2GB RAM

---

## Step-by-Step Deployment

### Step 1: Install Required Software in Baota Panel

1. **Login to Baota Panel** (usually at `http://YOUR_SERVER_IP:8888`)

2. **Install Node.js:**
   - Go to **Software Store** (软件商店)
   - Search for "Node.js"
   - Install **Node.js 18.x** or higher
   - After installation, install **pnpm** globally:
     ```bash
     npm install -g pnpm
     ```

3. **Install MySQL:**
   - Go to **Software Store**
   - Search for "MySQL"
   - Install **MySQL 8.0**
   - Remember the root password (Baota will show it)

4. **Install PM2:**
   - Go to **Software Store**
   - Search for "PM2"
   - Install PM2 Manager

---

### Step 2: Create MySQL Database

1. **In Baota Panel, go to Database**
2. Click **Add Database**
3. Fill in:
   - Database Name: `lions_vogue`
   - Username: `lions_vogue_user`
   - Password: Create a strong password (save this!)
   - Access Permissions: `localhost`
4. Click **Submit**

---

### Step 3: Upload Project Files

**Option A: Using Baota File Manager (Recommended)**

1. In Baota Panel, go to **Files** (文件)
2. Navigate to `/www/wwwroot/`
3. Create a new folder: `lions-vogue`
4. You'll need to upload the project files. Since you're working locally, you have two options:

   **Option 1: Download from this platform**
   - I'll create a zip file for you to download
   - Upload it to `/www/wwwroot/lions-vogue/` using Baota's file manager
   - Extract the zip file

   **Option 2: Use Git (if you have the code in a repository)**
   - SSH into your server
   - Navigate to `/www/wwwroot/`
   - Clone your repository: `git clone YOUR_REPO_URL lions-vogue`

**Option B: Using SFTP/SCP**
- Use FileZilla or WinSCP to upload files to `/www/wwwroot/lions-vogue/`

---

### Step 4: Configure Environment Variables

1. **SSH into your server** or use Baota's Terminal
2. Navigate to project directory:
   ```bash
   cd /www/wwwroot/lions-vogue/
   ```

3. **Create `.env` file:**
   ```bash
   nano .env
   ```

4. **Add the following configuration** (replace with your actual values):
   ```env
   # Database Configuration
   DATABASE_URL=mysql://lions_vogue_user:YOUR_DATABASE_PASSWORD@localhost:3306/lions_vogue

   # JWT Secret (generate a random string)
   JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure

   # OAuth Configuration (from Manus platform)
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   VITE_APP_ID=your_app_id_from_manus
   OWNER_OPEN_ID=your_manus_open_id
   OWNER_NAME=Your Name

   # Paystack Payment (add when you have it)
   VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

   # Application Branding
   VITE_APP_TITLE=Lions Vogue
   VITE_APP_LOGO=/logo.png

   # Built-in Services (from Manus platform)
   BUILT_IN_FORGE_API_URL=your_forge_api_url
   BUILT_IN_FORGE_API_KEY=your_forge_api_key

   # Production Settings
   NODE_ENV=production
   PORT=3000
   ```

5. **Save and exit** (Ctrl+X, then Y, then Enter)

---

### Step 5: Install Dependencies

```bash
cd /www/wwwroot/lions-vogue/
pnpm install
```

This will take a few minutes. Wait for it to complete.

---

### Step 6: Initialize Database

```bash
pnpm db:push
```

This creates all the necessary database tables.

---

### Step 7: Build the Application

```bash
pnpm build
```

This compiles the frontend and prepares the application for production.

---

### Step 8: Start Application with PM2

1. **In Baota Panel, go to PM2 Manager**
2. Click **Add Project**
3. Fill in:
   - **Project Name:** `lions-vogue`
   - **Project Directory:** `/www/wwwroot/lions-vogue`
   - **Startup File:** `server/_core/index.ts`
   - **Run Mode:** `tsx` or `node`
   - **Port:** `3000`

**OR use command line:**

```bash
cd /www/wwwroot/lions-vogue/
pm2 start npm --name "lions-vogue" -- start
pm2 save
pm2 startup
```

---

### Step 9: Configure Nginx (Reverse Proxy)

1. **In Baota Panel, go to Website**
2. Click **Add Site**
3. Fill in:
   - **Domain:** Your server IP (e.g., `123.45.67.89`) or domain if you have one
   - **Root Directory:** `/www/wwwroot/lions-vogue/`
   - **PHP Version:** Pure static (不使用PHP)
4. Click **Submit**

5. **Configure Reverse Proxy:**
   - Click on your site name
   - Go to **Reverse Proxy** tab
   - Click **Add Reverse Proxy**
   - Fill in:
     - **Proxy Name:** `lions-vogue`
     - **Target URL:** `http://127.0.0.1:3000`
     - **Enable:** Check the box
   - Click **Submit**

**OR manually edit Nginx config:**

Click **Settings** → **Configuration File**, and add this inside the `server` block:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
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

6. **Save and Reload Nginx**

---

### Step 10: Configure Firewall

1. **In Baota Panel, go to Security**
2. **Open Port 3000** (if not already open)
3. **Ensure Port 80 and 443 are open** for web access

---

### Step 11: Test Your Website

1. **Open your browser**
2. **Visit:** `http://YOUR_SERVER_IP`
3. **You should see the Lions Vogue homepage!**

---

## Post-Deployment Setup

### 1. Access Admin Panel
- Visit: `http://YOUR_SERVER_IP/admin`
- Sign in with your Manus account
- You'll be automatically set as admin

### 2. Configure Settings
- Go to **Admin → Settings**
- Add your WhatsApp number
- Add admin email
- Add customer support contact info

### 3. Add Categories
- Go to **Admin → Categories**
- Create product categories (e.g., Men's Wear, Women's Wear)

### 4. Add Products
- Go to **Admin → Products**
- Add your clothing products with images

### 5. Add Events
- Go to **Admin → Events**
- Create events and set ticket prices

---

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs lions-vogue

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart application
pm2 restart lions-vogue
```

### Database connection error
```bash
# Test database connection
mysql -u lions_vogue_user -p lions_vogue

# Check DATABASE_URL in .env file
cat /www/wwwroot/lions-vogue/.env | grep DATABASE_URL
```

### Nginx 502 Bad Gateway
```bash
# Check if application is running
pm2 status

# Check Nginx error logs in Baota Panel
# Website → Your Site → Log
```

### Can't access website
- Check firewall settings in Baota Panel
- Ensure ports 80, 443, and 3000 are open
- Check if Nginx is running in Baota Panel

---

## Maintenance Commands

```bash
# View application logs
pm2 logs lions-vogue

# Restart application
pm2 restart lions-vogue

# Stop application
pm2 stop lions-vogue

# View application status
pm2 status

# Update application (after making changes)
cd /www/wwwroot/lions-vogue/
git pull  # if using git
pnpm install
pnpm db:push  # if schema changed
pnpm build
pm2 restart lions-vogue
```

---

## Adding SSL Certificate (Optional but Recommended)

1. **Get a domain name first** (from Namecheap, GoDaddy, etc.)
2. **Point domain to your server IP** (A record)
3. **In Baota Panel:**
   - Go to your website settings
   - Click **SSL** tab
   - Choose **Let's Encrypt**
   - Enter your email
   - Click **Apply**
4. **Enable Force HTTPS**

---

## Important Notes

1. **Backup regularly:**
   - Database: Baota Panel → Database → Backup
   - Files: Baota Panel → Files → Compress and download

2. **Keep software updated:**
   - Update Node.js, MySQL, and Nginx regularly
   - Update project dependencies: `pnpm update`

3. **Monitor resources:**
   - Check CPU and RAM usage in Baota Panel
   - Upgrade server if needed

4. **Security:**
   - Change Baota Panel default port
   - Use strong passwords
   - Keep `.env` file secure
   - Regular security updates

---

## Need Help?

If you encounter any issues during deployment:
1. Check PM2 logs: `pm2 logs lions-vogue`
2. Check Nginx error logs in Baota Panel
3. Verify all environment variables are set correctly
4. Ensure all required software is installed

---

**Deployment Checklist:**
- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed
- [ ] PM2 installed
- [ ] Database created
- [ ] Project files uploaded
- [ ] .env file configured
- [ ] Dependencies installed (`pnpm install`)
- [ ] Database initialized (`pnpm db:push`)
- [ ] Application built (`pnpm build`)
- [ ] PM2 process started
- [ ] Nginx configured
- [ ] Firewall ports opened
- [ ] Website accessible
- [ ] Admin panel accessible
- [ ] Settings configured

---

**Your website will be live at:** `http://YOUR_SERVER_IP`

Once you have a domain, you can update the Nginx configuration to use your domain name and add SSL certificate for HTTPS.

