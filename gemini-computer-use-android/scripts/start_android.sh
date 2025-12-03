#!/bin/bash

CONTAINER_NAME="android-container"
IMAGE_NAME="budtmo/docker-android:emulator_11.0"
ADB_PORT=6520
WEB_PORT=6080

echo "--- 1. Cleaning up old containers ---"
docker rm -f $CONTAINER_NAME 2>/dev/null || true

echo "--- 2. Starting Android (Docker) ---"
# We map 6520->5555 (ADB) and 6080->6080 (Web View)
docker run -d \
    -p $ADB_PORT:5555 \
    -p $WEB_PORT:6080 \
    --device /dev/kvm \
    --name $CONTAINER_NAME \
    $IMAGE_NAME

echo "--- 3. Waiting for Boot (this takes ~2 mins) ---"
echo "You can follow the logs with: docker logs -f $CONTAINER_NAME"

# Optional: Loop to wait for ADB connection
echo "Waiting for ADB to become ready..."
counter=0
while [ $counter -lt 30 ]; do
    adb connect localhost:$ADB_PORT
    if adb -s localhost:$ADB_PORT shell getprop sys.boot_completed | grep -q "1"; then
        echo "✅ Android is BOOTED and READY!"
        exit 0
    fi
    echo "Still booting... ($counter/30)"
    sleep 5
    let counter=counter+1
done

echo "⚠️ Timed out waiting for boot. Run 'adb connect localhost:$ADB_PORT' manually later."
