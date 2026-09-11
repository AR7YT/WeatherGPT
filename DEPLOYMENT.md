# 🚀 WeatherGPT Deployment & App Publishing Guide

This guide walks you through publishing **WeatherGPT** as a **live public website** and as an **installable app** (Android, iOS, Windows, macOS, and Google Play Store).

---

## 🌟 Architecture Summary

- **Frontend**: Single-page modern application (`index.html`, `styles.css`, `app.js`).
- **Telemetry**: Real-time Open-Meteo Global NWP Models & CAMS Air Quality (zero API key required).
- **AI Brain**: Dual mode — Google Gemini 3.6 Flash/Pro (with natural Manglish) + Free built-in atmospheric NLP.
- **App Platform**: Progressive Web App (PWA) with Service Worker (`sw.js`) offline caching and Web App Manifest (`manifest.json`).

---

## Part 1: Publish as a Live Website

### Method 1: GitHub Pages (100% Free & Fastest)

Your project already has a GitHub repository configured at:  
👉 **`https://github.com/AR7YT/mcq-maker`**

#### Step 1: Commit and Push Changes to GitHub
Open PowerShell in your project folder (`c:\Users\asus\Desktop\New folder`) and run:

```powershell
# Using the installed Git executable:
& "C:\Users\asus\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe" add .
& "C:\Users\asus\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe" commit -m "feat: WeatherGPT with Gemini 3.6, Manglish, and PWA App support"
& "C:\Users\asus\AppData\Local\github-copilot-git-2.53.0-4\cmd\git.exe" push origin main
```
*(If prompted, sign in with your GitHub account credentials or Personal Access Token).*

#### Step 2: Enable GitHub Pages
1. Open your repository in your browser: **`https://github.com/AR7YT/mcq-maker`**
2. Click on **Settings** (top right tab).
3. In the left sidebar, click on **Pages** (under "Code and automation").
4. Under **Build and deployment** $\rightarrow$ **Branch**:
   - Select **`main`**.
   - Select folder **`/(root)`**.
   - Click **Save**.
5. Within 1 to 2 minutes, GitHub will publish your site at:  
   👉 **`https://ar7yt.github.io/mcq-maker/`**

---

### Method 2: Vercel (1-Click Instant Global CDN)

Vercel provides lightning-fast edge hosting, instant updates on every git push, and free custom domain support.

1. Go to **[vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Locate `AR7YT/mcq-maker` from your repositories list and click **Import**.
4. Leave all build settings at default (Static HTML) and click **Deploy**.
5. Your app will be live immediately with a free SSL domain like:  
   👉 **`https://weathergpt-ar7yt.vercel.app`**

---

### Method 3: Netlify

1. Go to **[netlify.com](https://www.netlify.com)** and sign in.
2. Click **Add new site** $\rightarrow$ **Import an existing project** $\rightarrow$ **GitHub**.
3. Select `mcq-maker` and click **Deploy mcq-maker**.

---

## Part 2: Publish as an Installable App

### Option A: 1-Click Progressive Web App (PWA) Install

Once your site is live on HTTPS (via GitHub Pages or Vercel):

#### On Android (Chrome / Edge / Samsung Internet):
1. Visit your live site URL in Chrome.
2. Tap the **"Install App"** button in the top navigation bar or tap the 3 dots menu (⋮) $\rightarrow$ **"Install app"** (or **"Add to Home screen"**).
3. The app icon will appear on your Android phone's home screen and app drawer. It opens in standalone full-screen mode without any browser URL bar!

#### On iPhone / iPad (Safari):
1. Visit your live site URL in **Safari**.
2. Tap the **Share** button <i class="fa-solid fa-arrow-up-from-bracket"></i> (at the bottom on iPhone, top on iPad).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. WeatherGPT is now installed on your iOS home screen as an app!

#### On Windows / Mac / Linux (Chrome / Edge / Brave):
1. Open your live site in Chrome or Edge.
2. Click the **"Install App"** button in the top navbar (or the install icon inside the browser address bar).
3. WeatherGPT installs as a desktop app with its own dock/taskbar icon and desktop shortcut.

---

### Option B: Generate an Android APK / Google Play Store Package via PWABuilder

To publish WeatherGPT to the **Google Play Store** or generate an **Android `.apk` file** to share with friends:

1. Deploy your website so you have an active HTTPS URL (e.g., `https://ar7yt.github.io/mcq-maker/`).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com/)** (created by Microsoft & Google).
3. Paste your live URL into the box and click **Start**.
4. PWABuilder checks your `manifest.json`, `sw.js`, and icons. Your score will be **100/100 (Store Ready)**!
5. Click **Package for Stores**:
   - **Android**:
     - Choose **Generate Package**.
     - Download the `.apk` file for direct installation on any Android phone.
     - Download the `.aab` (Android App Bundle) signed package ready to upload to the [Google Play Console](https://play.google.com/console).
   - **Windows**:
     - Generates a `.msix` package ready for the Microsoft Store.
   - **iOS / macOS**:
     - Generates an Xcode package ready for the Apple App Store.

---

## 🛠️ Offline & Caching Capabilities

- When users open WeatherGPT without an active internet connection, the Service Worker (`sw.js`) automatically serves cached app shell assets, UI styles, and recent weather briefings.
- Real-time weather requests fetch dynamically when online.
