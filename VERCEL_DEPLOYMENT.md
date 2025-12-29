# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment (Already Done)
- [x] Node.js 20.x configured in `package.json`
- [x] `.nvmrc` file created
- [x] `vercel.json` configuration file
- [x] Frontend build process working
- [x] Backend server configured
- [x] Database initialization scripts
- [x] Setup API endpoints created
- [x] All changes committed and pushed to GitHub

## 🔧 Deployment Steps

### Step 1: Deploy to Vercel
1. Push your code to GitHub (already done ✅)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the settings
6. Click "Deploy"

### Step 2: Configure Environment Variables (CRITICAL!)
**⚠️ Login will NOT work without these!**

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add these variables for **Production, Preview, and Development**:

```
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN = 7d
NODE_ENV = production
```

**Important**: 
- Make sure to check ALL THREE environment checkboxes (Production, Preview, Development)
- After adding variables, redeploy the application

### Step 3: Initialize Database (After First Deployment)

Once your app is deployed, you need to set up the database:

#### Option A: Using API Endpoints (Recommended)

1. **Check Status**:
   ```
   GET https://your-app.vercel.app/api/setup/status
   ```

2. **Initialize Database**:
   ```
   POST https://your-app.vercel.app/api/setup/init-db
   ```

3. **Seed Demo Accounts**:
   ```
   POST https://your-app.vercel.app/api/setup/seed-db
   ```

You can use these curl commands:
```bash
# Check status
curl https://your-app.vercel.app/api/setup/status

# Initialize database
curl -X POST https://your-app.vercel.app/api/setup/init-db

# Seed demo accounts
curl -X POST https://your-app.vercel.app/api/setup/seed-db
```

#### Option B: Using Postman or Browser

1. Open Postman or any API client
2. Send POST requests to the endpoints above
3. Verify success responses

### Step 4: Test Login

1. Go to your deployed URL: `https://your-app.vercel.app`
2. You should see the login page
3. Try logging in with:
   - **Username**: `admin`
   - **Password**: `password123`
4. You should be redirected to the Admin Dashboard

## 🔍 Troubleshooting

### Login fails with "Login failed"
**Cause**: Environment variables not set
**Solution**: 
1. Go to Vercel Settings → Environment Variables
2. Verify `JWT_SECRET` and `JWT_EXPIRES_IN` are set
3. Redeploy the application

### "Database not initialized" error
**Cause**: Database setup not run
**Solution**: 
1. Call the setup endpoints (see Step 3)
2. Verify with `/api/setup/status`

### Build fails on Vercel
**Cause**: Dependency issues or Node version mismatch
**Solution**:
1. Check Vercel build logs
2. Verify Node.js 20.x is being used
3. Check that all dependencies are in `package.json`

### CORS errors in browser
**Cause**: Frontend trying to call external API
**Solution**: 
- The app is configured to serve frontend and backend together
- No CORS issues should occur

## 📝 Demo Credentials

All accounts use password: **password123**

### Admin
- Username: `admin`

### Drivers
- `driver1`, `driver2`, `driver3`, `driver4`, `driver5`

### Students
- `student1`, `student2`, `student3`, `student4`, `student5`

## ⚠️ Important Notes

### Database Persistence
- **SQLite on Vercel**: The database is stored in `/tmp` which is ephemeral
- **Consequence**: Database will reset on each deployment or cold start
- **For Production**: Consider using Vercel Postgres or external database

### Security
- **Setup Endpoints**: The `/api/setup/*` endpoints should be protected or removed in production
- **JWT Secret**: Use a strong, random secret in production
- **Demo Accounts**: Change or remove demo accounts in production

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ App loads at your Vercel URL
- ✅ Login page is visible
- ✅ Can login with demo credentials
- ✅ Redirects to appropriate dashboard based on role
- ✅ No errors in browser console
- ✅ No errors in Vercel function logs

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel function logs: Project → Deployments → Click deployment → Functions
2. Check browser console (F12)
3. Verify environment variables are set
4. Ensure database is initialized

## 🔗 Useful Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
