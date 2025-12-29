# 🚀 Quick Deployment Reference

## 📋 Vercel Environment Variables (MUST ADD!)

Go to: **Vercel Project → Settings → Environment Variables**

Add these for **ALL environments** (Production, Preview, Development):

```
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN = 7d
NODE_ENV = production
```

## 🔧 After First Deployment

Run these commands in order (replace `your-app.vercel.app` with your actual URL):

```bash
# 1. Initialize database
curl -X POST https://your-app.vercel.app/api/setup/init-db

# 2. Seed demo accounts
curl -X POST https://your-app.vercel.app/api/setup/seed-db

# 3. Check status
curl https://your-app.vercel.app/api/setup/status
```

## 🔑 Test Login

- **URL**: `https://your-app.vercel.app`
- **Username**: `admin`
- **Password**: `password123`

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed on Vercel
- [ ] Environment variables added (JWT_SECRET, JWT_EXPIRES_IN)
- [ ] Redeployed after adding env vars
- [ ] Database initialized (`/api/setup/init-db`)
- [ ] Demo accounts seeded (`/api/setup/seed-db`)
- [ ] Login tested successfully

## 🐛 If Login Fails

1. **Check environment variables** in Vercel Settings
2. **Redeploy** after adding env vars
3. **Initialize database** using setup endpoints
4. **Check browser console** (F12) for errors
5. **Check Vercel logs** for backend errors

## 📞 Quick Test

```bash
# Test if backend is responding
curl https://your-app.vercel.app/api/health

# Expected response:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

---

**See `VERCEL_DEPLOYMENT.md` for detailed instructions**
