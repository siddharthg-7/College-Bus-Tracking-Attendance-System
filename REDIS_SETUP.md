# 🍎 Redis Setup Guide

Redis is used in this project to provide **Instant Map Loads**. Without Redis, students have to wait for the core GPS ping; with Redis, they see the bus's last known location the second they log in.

Follow these steps to get Redis running on your machine:

---

## 💻 1. Installation

### **For Windows (Recommended)**
Windows does not officially support Redis, but you have two great options:

**Option A: Memurai (Easiest)**
1. Go to [Memurai.com](https://www.memurai.com/get-memurai).
2. Download and run the `.msi` installer.
3. Once installed, it runs automatically as a Windows service.

**Option B: WSL2 (Native Linux feel)**
1. Open PowerShell and run: `wsl --install` (if not already installed).
2. Inside your Linux terminal, run:
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

---

### **For macOS**
Using Homebrew:
1. Open Terminal and run:
   ```bash
   brew install redis
   ```
2. Start the service:
   ```bash
   brew services start redis
   ```

---

### **For Linux (Ubuntu/Debian)**
1. Open Terminal and run:
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```
2. Enable and start:
   ```bash
   sudo systemctl enable redis-server
   sudo systemctl start redis-server
   ```

---

## 🔍 2. Verify Redis is Running

Open your terminal and type:
```bash
redis-cli ping
```
If you get **`PONG`**, Redis is ready! 🎉

---

## ⚙️ 3. Connecting to the App

No extra configuration is needed! The app is already programmed to find Redis at the default location (`localhost:6379`).

1. Ensure Redis is running using the steps above.
2. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Look for this line in the console:
   `📡 Redis: Connected`

---

## 🛠️ 4. Useful Redis Commands (Optional)

If you want to "peek into the brain" of the bus tracker while it's running:

*   **See all cached buses**: `redis-cli keys "bus_location:*"`
*   **See location data for a specific bus**: `redis-cli get "bus_location:BUS_ID_HERE"`
*   **Clear the cache**: `redis-cli flushall`
