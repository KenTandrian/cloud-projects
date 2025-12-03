#!/bin/bash

# Stop on error
set -e

echo "--- 1. Updating System ---"
sudo apt update && sudo apt upgrade -y

echo "--- 2. Installing Dependencies (Python, ADB, Git) ---"
sudo apt install -y python3-pip python3-venv adb git unzip curl

echo "--- 3. Installing Docker ---"
if ! command -v docker &> /dev/null; then
    sudo apt install -y docker.io
    sudo chmod 666 /var/run/docker.sock
    echo "Docker installed successfully."
else
    echo "Docker is already installed."
fi

echo "--- 4. Checking Virtualization ---"
if [ $(grep -c -w "vmx\|svm" /proc/cpuinfo) -eq 0 ]; then
    echo "❌ WARNING: Virtualization (Nested Virtualization) NOT detected!"
    echo "   Android will fail to run. Please recreate the VM with Nested Virtualization enabled."
else
    echo "✅ Virtualization support detected."
fi

echo "--- Setup Complete! ---"
echo "You can now run 'start_android.sh'"
