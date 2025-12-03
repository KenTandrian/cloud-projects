#!/bin/bash

APK_PATH=$1

if [ -z "$APK_PATH" ]; then
    echo "Usage: ./scripts/install_app.sh <path_to_apk_or_xapk>"
    exit 1
fi

ADB_CMD="adb -s localhost:6520"

echo "--- Connecting to ADB ---"
$ADB_CMD connect localhost:6520

if [[ "$APK_PATH" == *".xapk" ]] || [[ "$APK_PATH" == *".zip" ]]; then
    echo "--- Detected XAPK/Bundle ---"
    TEMP_DIR="temp_install_$(date +%s)"
    mkdir -p $TEMP_DIR
    
    echo "Extracting..."
    unzip -q "$APK_PATH" -d $TEMP_DIR
    
    echo "Installing splits..."
    # Install all APKs in the extracted folder
    $ADB_CMD install-multiple "$TEMP_DIR"/*.apk
    
    echo "Cleaning up..."
    rm -rf $TEMP_DIR
else
    echo "--- Detected Standard APK ---"
    $ADB_CMD install "$APK_PATH"
fi

echo "--- Verifying Installation ---"
$ADB_CMD shell pm list packages | grep "tiket"
