#!/bin/bash

echo "========================================"
echo "E-Library Android Build Script"
echo "========================================"
echo ""

# Set environment for Android build
export NODE_ENV=production
export REACT_APP_API_BASE_URL=http://10.0.2.2:4000/api

echo "[1/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo ""
echo "[2/4] Building React app..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: npm build failed"
    exit 1
fi

echo ""
echo "[3/4] Syncing to Capacitor Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "ERROR: Capacitor sync failed"
    exit 1
fi

echo ""
echo "[4/4] Building Android app..."
cd android
./gradlew build
if [ $? -ne 0 ]; then
    echo "ERROR: Android build failed"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "========================================"
echo "Build completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Open Android Studio"
echo "2. Open the 'android' folder as a project"
echo "3. Start Android Emulator (AVD Manager)"
echo "4. Click Run or press Shift+F10"
echo ""
