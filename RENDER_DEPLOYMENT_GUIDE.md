# 🚀 Step-by-Step Guide: Deploy to Render.com

## Complete Deployment Guide for College Bus Tracking System

**Time Required:** 5-10 minutes  
**Cost:** FREE (Render Free Tier)  
**Difficulty:** Easy ⭐

---

## ✅ Prerequisites

Before you start, make sure you have:
- [x] GitHub account
- [x] Your repository pushed to GitHub: `siddharthg-7/College-Bus-Tracking-Attendance-System`
- [x] `render.yaml` file in your repository (✅ Already added!)

---

## 📋 Step-by-Step Instructions

### **Step 1: Create Render Account**

1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. Complete the signup process

**Screenshot:** You'll see the Render dashboard after signing up.

---

### **Step 2: Create New Web Service**

1. On the Render Dashboard, click the **"New +"** button (top right)
2. Select **"Web Service"** from the dropdown menu

**What you'll see:**
- A page asking you to connect a repository

---

### **Step 3: Connect Your GitHub Repository**

1. Click **"Connect a repository"** or **"Configure account"**
2. You'll see a list of your GitHub repositories
3. Find **"College-Bus-Tracking-Attendance-System"**
4. Click **"Connect"** next to your repository

**If you don't see your repository:**
- Click **"Configure account"** at the bottom
- Grant Render access to your repositories
- Return and refresh the list

---

### **Step 4: Configure Your Web Service**

Render will **automatically detect** your `render.yaml` file! You'll see:

**Auto-detected settings:**
- ✅ **Name:** `college-bus-tracker`
- ✅ **Environment:** `Node`
- ✅ **Build Command:** Already configured
- ✅ **Start Command:** Already configured
- ✅ **Plan:** Free

**You don't need to change anything!** Just verify:

```
Name: college-bus-tracker
Region: Oregon (US West) or closest to you
Branch: main
Build Command: npm install && cd backend && npm install && cd ../frontend && npm install && npm run build
Start Command: cd backend && node server.js
```

---

### **Step 5: Set Environment Variables** (IMPORTANT!)

Scroll down to **"Environment Variables"** section:

**These are already configured in render.yaml:**
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `10000`
- ✅ `JWT_SECRET` = (already set)
- ✅ `JWT_EXPIRES_IN` = `7d`

**You can verify or update them:**
1. Click **"Advanced"** to see environment variables
2. Confirm `JWT_SECRET` is set (it should be auto-populated from render.yaml)
3. If you want to change JWT_SECRET, click **"Add Environment Variable"**:
   - Key: `JWT_SECRET`
   - Value: `your-secret-key-here` (or use the one from render.yaml)

---

### **Step 6: Deploy!**

1. Scroll to the bottom
2. Click the big **"Create Web Service"** button
3. Render will start building your application

**What happens next:**
- ⏳ Render clones your repository
- ⏳ Installs dependencies (npm install)
- ⏳ Builds frontend (npm run build)
- ⏳ Starts backend server
- ⏳ Runs health checks

**This takes 3-5 minutes.** You'll see a live log of the deployment process.

---

### **Step 7: Monitor Deployment**

You'll see a **live deployment log** with messages like:

```
==> Cloning from https://github.com/siddharthg-7/College-Bus-Tracking-Attendance-System...
==> Downloading cache...
==> Running build command 'npm install && cd backend && npm install...'
==> Installing dependencies...
==> Building frontend...
==> Build successful!
==> Starting service with 'cd backend && node server.js'...
==> 🚀 College Bus Tracker Backend
==> 🌐 Server running on port 10000
==> 📡 WebSocket enabled
==> 🗄️  Database connected
==> Your service is live! 🎉
```

**Wait for:** ✅ **"Your service is live!"** message

---

### **Step 8: Get Your Live URL**

Once deployed, you'll see:

1. **Your app URL** at the top (something like):
   ```
   https://college-bus-tracker.onrender.com
   ```

2. **Status:** Should show a green **"Live"** indicator

3. Click the URL to open your application!

---

### **Step 9: Test Your Application**

1. Click your Render URL (e.g., `https://college-bus-tracker.onrender.com`)
2. You should see the **Login Page**
3. Click a **Demo Account** button (Student, Driver, or Admin)
4. Click **"Login"**
5. You should be redirected to the appropriate dashboard!

**Test Accounts:**
- Student: `student1` / `password123`
- Driver: `driver1` / `password123`
- Admin: `admin` / `password123`

---

## 🎯 Troubleshooting

### **Issue 1: Build Failed**

**Error:** "Build command failed"

**Solution:**
1. Check the build logs for specific errors
2. Make sure `render.yaml` is in the root of your repository
3. Verify all dependencies are in `package.json`

### **Issue 2: Service Won't Start**

**Error:** "Service failed to start"

**Solution:**
1. Check if `PORT` environment variable is set to `10000`
2. Verify `backend/server.js` exists
3. Check logs for database connection errors

### **Issue 3: 404 Not Found**

**Error:** Page shows 404

**Solution:**
1. Make sure frontend was built successfully
2. Check that `frontend/dist` directory exists after build
3. Verify `backend/server.js` serves static files

### **Issue 4: Database Not Found**

**Error:** "Database file not found"

**Solution:**
1. Check that `backend/database/bus_tracker.db` is in your repository
2. Verify `.gitignore` is not excluding `.db` files
3. Confirm database files were pushed to GitHub

---

## 🔧 Advanced Configuration

### **Custom Domain (Optional)**

1. Go to your service **Settings**
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter your domain name
5. Follow DNS configuration instructions

### **Environment Variables**

To add or update environment variables:

1. Go to your service **Environment** tab
2. Click **"Add Environment Variable"**
3. Enter key and value
4. Click **"Save Changes"**
5. Service will automatically redeploy

### **View Logs**

To see application logs:

1. Click **"Logs"** tab in your service
2. You'll see real-time server logs
3. Useful for debugging issues

### **Manual Deploy**

To trigger a manual deployment:

1. Click **"Manual Deploy"** button
2. Select **"Deploy latest commit"**
3. Or choose a specific commit/branch

---

## 📊 What You Get with Render Free Tier

✅ **750 hours/month** of runtime (enough for 24/7 operation)  
✅ **512 MB RAM**  
✅ **WebSocket support** (Socket.IO works!)  
✅ **Automatic HTTPS** (SSL certificate included)  
✅ **Automatic deployments** (on git push)  
✅ **Free subdomain** (yourapp.onrender.com)  
✅ **Persistent disk** (SQLite database persists!)  

⚠️ **Limitations:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- 100 GB bandwidth/month

**Upgrade to paid plan ($7/month) for:**
- No spin-down
- More RAM and CPU
- Custom domains
- Priority support

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Service shows **"Live"** status (green indicator)
- [ ] Can access your URL (e.g., `https://college-bus-tracker.onrender.com`)
- [ ] Login page loads correctly
- [ ] Can login with demo accounts
- [ ] Dashboard loads after login
- [ ] No console errors in browser
- [ ] WebSocket connects successfully (check browser console)

---

## 🔄 Automatic Deployments

**Good news!** Render automatically deploys when you push to GitHub:

1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Render **automatically detects** the push
4. Starts a new deployment
5. Your app updates in 3-5 minutes!

**You can disable auto-deploy:**
- Go to **Settings** → **Build & Deploy**
- Toggle **"Auto-Deploy"** off

---

## 📱 Accessing Your App

Your application will be available at:

```
https://college-bus-tracker.onrender.com
```

**Share this URL with:**
- ✅ Students (for tracking buses)
- ✅ Drivers (for updating location)
- ✅ Admins (for monitoring system)
- ✅ Anyone with demo credentials

**Mobile Access:**
- Works on any device with a browser
- Responsive design
- Real-time updates via WebSocket

---

## 🆘 Need Help?

### **Render Support**
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### **Your Project**
- Check `DEPLOYMENT_GUIDE.md` for general deployment info
- See `LOGIN_GUIDE.md` for demo credentials
- Review `QUICKSTART.md` for local development

### **Common Issues**

**Q: Service keeps spinning down?**  
A: This is normal on free tier. Upgrade to paid plan for 24/7 uptime.

**Q: Database data lost after redeploy?**  
A: Make sure database files are in your repository and not in `.gitignore`.

**Q: WebSocket not connecting?**  
A: Check browser console for errors. Verify `socket.io` is installed.

**Q: Login fails with 401?**  
A: Check that `JWT_SECRET` environment variable is set correctly.

---

## 🎯 Quick Reference

### **Render Dashboard URLs**

- **Main Dashboard:** https://dashboard.render.com
- **Your Service:** https://dashboard.render.com/web/[your-service-id]
- **Logs:** Click "Logs" tab in your service
- **Settings:** Click "Settings" tab in your service

### **Useful Commands**

```bash
# View service logs (if you have Render CLI)
render logs

# Trigger manual deploy
# (Use dashboard or Render CLI)

# Check service status
# (Use dashboard)
```

### **Important Files**

- `render.yaml` - Deployment configuration
- `backend/server.js` - Main server file
- `backend/.env` - Environment variables (local only)
- `frontend/dist/` - Built frontend (generated during deploy)

---

## ✅ Final Steps

After successful deployment:

1. **Test all features:**
   - Login with all three roles
   - Check real-time features
   - Verify database operations

2. **Update your README:**
   - Add your live URL
   - Update deployment instructions

3. **Share your app:**
   - Give URL to users
   - Provide demo credentials
   - Collect feedback

4. **Monitor performance:**
   - Check Render dashboard regularly
   - Review logs for errors
   - Monitor uptime

---

## 🎉 Congratulations!

Your **College Bus Tracking & Attendance System** is now live on the internet! 🚀

**Live URL:** `https://college-bus-tracker.onrender.com` (or your custom URL)

**What's Working:**
- ✅ Real-time GPS tracking
- ✅ WebSocket connections
- ✅ Student/Driver/Admin dashboards
- ✅ Attendance locking system
- ✅ Notifications
- ✅ All features!

**Next Steps:**
- Share with users
- Collect feedback
- Add new features
- Scale as needed

---

**Need to redeploy?** Just push to GitHub - Render handles the rest! 🚀

**Questions?** Check the troubleshooting section above or Render's documentation.

**Happy deploying! 🎉**
