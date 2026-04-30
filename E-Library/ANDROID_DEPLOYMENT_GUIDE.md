# 📱 Android App Deployment Guide - E-Library

## ✅ Completed Steps

- ✅ Capacitor installed
- ✅ React app built for production
- ✅ Android project created (`frontend/android/` folder)

---

## 🔧 Step 2: Configure Backend URLs

Your app currently uses `localhost:8080`. For the Android app, you need to:

### Option A: Deploy Backend to Cloud (RECOMMENDED)

**Backend needs to be accessible from anywhere.**

#### Option A1: Deploy to Azure (Recommended for You)
1. Host your Java backend on Azure App Service
2. Get public URL: `https://your-app.azurewebsites.net`
3. Update API endpoints

#### Option A2: Deploy to Heroku (Free alternative)
1. Host Java backend on Heroku
2. Get URL: `https://your-app.herokuapp.com`

### Option B: Test with Local Backend (Dev Only)
- Works only if phone/emulator on same WiFi as your PC
- Not suitable for Play Store production

---

## 📋 Step 3: Update API Endpoints

Files to update:

```
frontend/src/services/
├── ReaderService.js (hardcoded localhost)
├── FeedbackService.js (hardcoded localhost)
└── ActivityService.js (uses env var ✅)
```

**Create `.env` file in `frontend/`:**

```env
# For Android App - Point to your cloud backend
REACT_APP_API_BASE_URL=https://your-backend.azurewebsites.net
REACT_APP_PYTHON_API_URL=https://your-python-app.azurewebsites.net

# For local testing
REACT_APP_LOCAL_MODE=false
```

---

## 🏗️ Step 4: Build Android App

### Prerequisites (Install if needed)
1. **Java Development Kit (JDK)** - Version 11 or higher
2. **Android SDK** - via Android Studio
3. **Android Studio** - Free IDE for Android development

### Build APK (For Play Store)

```bash
cd frontend/android
./gradlew build
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Build APK (For Emulator/Testing)
```bash
cd frontend/android
./gradlew assemble
# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔐 Step 5: Sign App for Play Store

### Create Keystore (One-time)
```bash
keytool -genkey -v -keystore ~/elibrary.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias elibrary

# Enter details:
# Password: (create strong password)
# First and Last Name: Your Name
# Organization: Your Company
# City: Your City
# State: Your State
# Country: LK (for Sri Lanka)
```

### Configure Signing in Android Studio
1. Open `android/app/build.gradle`
2. Add signing config:

```gradle
android {
  signingConfigs {
    release {
      keyAlias 'elibrary'
      keyPassword 'YOUR_PASSWORD'
      storeFile file('elibrary.keystore')
      storePassword 'YOUR_PASSWORD'
    }
  }

  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

---

## 📦 Step 6: Google Play Store Setup

### Create Developer Account
1. Go to https://play.google.com/console
2. Create Google Play Developer Account ($25 USD, one-time)
3. Fill in profile details

### Create App on Play Store
1. Click "Create App"
2. Fill in details:
   - **App name:** E-Library
   - **Default language:** English
   - **App type:** Free / Paid
   - **Category:** Books & Reference

### Set Up App Details
- **Icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Screenshots:** 4-5 minimum (Nexus 5X size)
- **Description:** Write compelling description
- **Short description:** Max 80 characters
- **Content rating:** Fill questionnaire

### Upload APK/AAB
1. Navigate to "Release" → "Production"
2. Upload your signed app (`.aab` or `.apk`)
3. Review app details
4. Click "Submit for Review"

**Review time:** 2-4 hours usually

---

## 🎯 Step 7: Backend Deployment Options

### Option: Azure App Service (RECOMMENDED)

#### Deploy Java Backend
```bash
cd E-Library/backend

# Create Azure resources
az appservice plan create --name elibrary-plan --resource-group mygroup --sku B1 --is-linux
az webapp create --resource-group mygroup --plan elibrary-plan --name elibrary-api --runtime "JAVA|11"

# Configure for Spring Boot
az webapp config set --resource-group mygroup --name elibrary-api --linux-fx-version "JAVA|11-java11"

# Deploy
mvn clean package
az webapp deployment source config-zip --resource-group mygroup --name elibrary-api --src target/backend.jar
```

#### Deploy Python App
```bash
cd E-Library/Python-ranker

# Create container
docker build -t elibrary-py .
docker tag elibrary-py myregistry.azurecr.io/elibrary-py:latest
docker push myregistry.azurecr.io/elibrary-py:latest

# Deploy to Azure Container Instances
az container create --resource-group mygroup --name elibrary-py --image myregistry.azurecr.io/elibrary-py
```

---

## 🧪 Step 8: Testing

### Test on Android Emulator
```bash
cd frontend/android
./gradlew :app:installDebug
```

### Test on Real Device
1. Enable "Developer Mode" on Android phone
2. Connect via USB
3. Run: `./gradlew :app:installDebug`

---

## 📝 Checklist Before Play Store Submission

- [ ] Backend deployed and accessible from internet
- [ ] All API endpoints pointing to cloud backend
- [ ] App tested on emulator and real device
- [ ] App icon and graphics prepared
- [ ] Description and privacy policy written
- [ ] Keystore created and securely stored
- [ ] App signed with release keystore
- [ ] AAB uploaded to Play Store Console
- [ ] Content rating completed
- [ ] Pricing set (Free or Paid)

---

## 🔗 Quick Links

- **Capacitor Docs:** https://capacitorjs.com
- **Google Play Console:** https://play.google.com/console
- **Android Studio:** https://developer.android.com/studio
- **Azure Deployment:** https://docs.microsoft.com/en-us/azure/app-service

---

## ⚠️ Important Notes

1. **Keep Keystore Safe:** Store `elibrary.keystore` securely - you need it for future updates
2. **API Deployment:** Without backend deployed, Android app won't work
3. **Testing First:** Always test thoroughly before submitting to Play Store
4. **Versioning:** Update `versionCode` in `android/app/build.gradle` for updates

---

## 📞 Next Steps

1. **Deploy Backend** (Do this first!)
   - Choose Azure or Heroku
   - Get public URL
   - Test endpoint accessibility

2. **Update API URLs**
   - Modify `.env` with backend URL
   - Rebuild React app: `npm run build`
   - Sync to Android: `npx cap sync`

3. **Build & Sign**
   - Create keystore
   - Build release APK/AAB
   - Test on device

4. **Submit to Play Store**
   - Upload signed APK
   - Fill store listing
   - Submit for review

**Ready to start? Let me know which step you need help with! 🚀**
