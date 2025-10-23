# Lions Vogue - Complete Deployment Guide for Baota Panel

## 📋 Prerequisites
- Baota Panel installed on your server
- Domain: `lionsvogue.com` pointed to your server
- SSH access to your server

---

## 🗄️ Step 1: Create MySQL Database

1. **Login to Baota Panel** (usually at `http://your-server-ip:8888`)

2. **Go to Database → MySQL**

3. **Create New Database:**
   - Database Name: `lions_vogue`
   - Username: `lions_vogue_user`
   - Password: `bigmarvandlions`
   - Access Permissions: `localhost` (or `%` for remote access)
   - Click **Submit**

4. **Note down the connection details:**
   ```
   Host: localhost
   Port: 3306
   Database: lions_vogue
   Username: lions_vogue_user
   Password: bigmarvandlions
   ```

---

## 🌐 Step 2: Create Website in Baota

1. **Go to Website → Add Site**

2. **Configure:**
   - Domain: `lionsvogue.com` (and `www.lionsvogue.com`)
   - Root Directory: `/www/wwwroot/lionsvogue`
   - PHP Version: **Pure Static** or **Node.js** (we'll use Node.js)
   - Database: Select the `lions_vogue` database you created
   - Click **Submit**

3. **Configure SSL (Optional but Recommended):**
   - Go to your site settings → SSL
   - Use Let's Encrypt to get a free SSL certificate
   - Enable HTTPS redirect

---

## 📦 Step 3: Install Node.js

1. **Go to Software Store → Runtime Environment**

2. **Install Node.js:**
   - Find **Node.js Version Manager (NVM)**
   - Install it
   - Then install **Node.js v18** or **v20**

3. **Verify installation via SSH:**
   ```bash
   node -v
   npm -v
   ```

---

## 🚀 Step 4: Deploy the Application

### Option A: Using Git (Recommended)

1. **SSH into your server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Navigate to website directory:**
   ```bash
   cd /www/wwwroot/lionsvogue
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/Effmarv/lions-vogue.git .
   ```
   
   Or if directory is not empty:
   ```bash
   rm -rf *
   git clone https://github.com/Effmarv/lions-vogue.git .
   ```

4. **Install pnpm:**
   ```bash
   npm install -g pnpm
   ```

5. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Option B: Manual Upload

1. **Download the project from GitHub:**
   - Go to https://github.com/Effmarv/lions-vogue
   - Click **Code → Download ZIP**

2. **Upload to server:**
   - In Baota Panel → Files
   - Navigate to `/www/wwwroot/lionsvogue`
   - Upload and extract the ZIP file

3. **Install dependencies via SSH:**
   ```bash
   cd /www/wwwroot/lionsvogue
   npm install -g pnpm
   pnpm install
   ```

---

## ⚙️ Step 5: Configure Environment Variables

1. **Create `.env` file:**
   ```bash
   cd /www/wwwroot/lionsvogue
   nano .env
   ```

2. **Add the following content:**
   ```env
   # Database Configuration
   DATABASE_URL=mysql://lions_vogue_user:bigmarvandlions@localhost:3306/lions_vogue

   # Server Configuration
   NODE_ENV=production
   PORT=3000

   # Site Configuration (Optional - already in code)
   SITE_URL=https://lionsvogue.com
   ADMIN_EMAIL=Lionsvogue@gmail.com
   ```

3. **Save and exit** (Ctrl+X, then Y, then Enter)

---

## 🗃️ Step 6: Initialize Database Schema

1. **Run database migrations:**
   ```bash
   cd /www/wwwroot/lionsvogue
   pnpm db:push
   ```

2. **Insert initial settings (via MySQL):**
   
   Login to MySQL:
   ```bash
   mysql -u lions_vogue_user -pbigmarvandlions lions_vogue
   ```

   Run these SQL commands:
   ```sql
   INSERT INTO settings (key, value, description) 
   VALUES 
   ('admin_email', 'Lionsvogue@gmail.com', 'Admin email for order confirmations'),
   ('whatsapp_number', '2348137407513', 'Admin WhatsApp for order notifications'),
   ('support_email', 'Lionsvogue@gmail.com', 'Customer support email'),
   ('support_whatsapp', '2348137407513', 'Customer support WhatsApp'),
   ('support_instagram', 'https://www.instagram.com/lionsvogue', 'Instagram profile URL'),
   ('support_tiktok', 'https://www.tiktok.com/@lionsvogue?_t=ZS-90mrHerruNj&_r=1', 'TikTok profile URL')
   ON DUPLICATE KEY UPDATE key=key;
   ```

   Exit MySQL:
   ```sql
   exit;
   ```

3. **Create admin user (Optional):**
   ```sql
   mysql -u lions_vogue_user -pbigmarvandlions lions_vogue -e "
   INSERT INTO users (openId, name, email, role, loginMethod) 
   VALUES ('admin-001', 'Admin User', 'Lionsvogue@gmail.com', 'admin', 'local');
   "
   ```

---

## 🏗️ Step 7: Build the Application

1. **Build the production version:**
   ```bash
   cd /www/wwwroot/lionsvogue
   pnpm build
   ```

2. **This will create:**
   - `dist/` folder with compiled server code
   - `dist/public/` folder with static frontend assets

---

## 🔄 Step 8: Configure PM2 (Process Manager)

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start the application:**
   ```bash
   cd /www/wwwroot/lionsvogue
   pm2 start dist/index.js --name "lions-vogue"
   ```

3. **Configure PM2 to start on boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

4. **Useful PM2 commands:**
   ```bash
   pm2 status              # Check app status
   pm2 logs lions-vogue    # View logs
   pm2 restart lions-vogue # Restart app
   pm2 stop lions-vogue    # Stop app
   ```

---

## 🌐 Step 9: Configure Nginx Reverse Proxy

1. **In Baota Panel → Website → Your Site → Settings**

2. **Go to "Reverse Proxy"**

3. **Add Proxy:**
   - Proxy Name: `Lions Vogue Node.js`
   - Target URL: `http://127.0.0.1:3000`
   - Enable: ✅
   - Click **Submit**

4. **Or manually edit Nginx config:**
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

5. **Reload Nginx:**
   ```bash
   nginx -t
   nginx -s reload
   ```

---

## ✅ Step 10: Verify Deployment

1. **Check if app is running:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Visit your website:**
   - Open browser: `https://lionsvogue.com`
   - You should see the Lions Vogue homepage

3. **Test admin panel:**
   - Go to: `https://lionsvogue.com/admin`
   - Login with your admin credentials

---

## 🔄 Updating the Application

When you need to update the site:

```bash
cd /www/wwwroot/lionsvogue
git pull origin main
pnpm install
pnpm build
pm2 restart lions-vogue
```

---

## 🐛 Troubleshooting

### App won't start:
```bash
pm2 logs lions-vogue  # Check error logs
```

### Database connection error:
- Verify DATABASE_URL in `.env`
- Check MySQL is running: `systemctl status mysql`
- Verify database credentials

### Port already in use:
```bash
lsof -i :3000  # Find what's using port 3000
pm2 delete lions-vogue
pm2 start dist/index.js --name "lions-vogue"
```

### Nginx 502 Bad Gateway:
- Check if Node.js app is running: `pm2 status`
- Check Nginx error logs: `/www/wwwroot/lionsvogue/logs/error.log`

---

## 📞 Support

- **Email**: Lionsvogue@gmail.com
- **WhatsApp**: https://wa.me/2348137407513
- **Instagram**: https://www.instagram.com/lionsvogue
- **TikTok**: https://www.tiktok.com/@lionsvogue

---

## 🎉 You're Done!

Your Lions Vogue website should now be live at **https://lionsvogue.com**

Features available:
- ✅ Fashion product catalog
- ✅ Event ticket booking
- ✅ Shopping cart
- ✅ Order management
- ✅ Admin dashboard
- ✅ WhatsApp order notifications
- ✅ Email confirmations
- ✅ Social media integration

