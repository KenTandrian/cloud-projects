# 🤖 Android Agent with Gemini Computer Use

> ⚠️ This project is a **Proof of Concept (PoC)** designed for experimental and educational purposes only.
> *   **Preview APIs:** It relies on Gemini "Computer Use" capabilities which are currently in Preview and subject to breaking changes.
> *   **Security:** This setup enables ADB over local TCP and uses plain text configuration. It is **not secured** for public deployment.
> *   **Stability:** Running Android Emulators inside Docker containers on Cloud VMs (Nested Virtualization) can be resource-intensive and prone to instability.
>
> **Do not use this environment to process real financial data, credit cards, or sensitive personal information.**

---

This project implements an AI Agent capable of controlling a virtual Android device to perform tasks (e.g., booking hotels, changing settings).

It uses **Google Gemini 2.5** (Computer Use Preview) to "see" the screen via screenshots and "act" via ADB (Android Debug Bridge). The Android environment runs inside a Docker container on a Google Cloud VM.

## 📂 Project Structure

```text
.
├── app/
│   ├── adb.py         # Hardware layer: ADB commands & Screenshotting
│   ├── config.py      # Settings: API Keys, Package names, Prompts
│   └── tools.py       # Logic layer: Tools definitions (open_app, click, etc.)
├── scripts/
│   ├── install_app.sh    # Helper to install APK/XAPK files
│   ├── setup_vm.sh       # Installs Docker, Python, ADB on fresh Ubuntu
│   └── start_android.sh  # Launches the Android Docker container
├── main.py            # Entry point: The Agent Loop
├── requirements.txt   # Python dependencies
└── .env               # Secrets (API Key)
```

---

## 🛠 Prerequisites

1.  **Google Compute Engine VM Instance**:
    *   **OS:** Ubuntu 22.04 LTS (x86_64)
    *   **Machine Type:** N1-Standard-4 (Recommended)
    *   **Important:** **"Enable Nested Virtualization"** must be checked in VM settings.
2.  **Gemini API Key:** Get one from [Google AI Studio](https://aistudio.google.com/).
3.  **Local Machine:** You need a terminal (Mac/Linux) or PowerShell (Windows).

---

## 🚀 Installation & Setup

### 1. VM Setup (Run on Google Compute Engine VM)
SSH into your VM and run the setup scripts.

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Install System Dependencies (Docker, ADB, Python)
./scripts/setup_vm.sh

# 3. Create Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Configuration
Create the `.env` file from the template.

```bash
cp .env.example .env
nano .env
```
Paste your key:
```ini
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_HERE
```

### 3. Launch Android
Start the Docker container (Android 11 Emulator).

```bash
./scripts/start_android.sh
```
*Wait 2-3 minutes for the device to fully boot.*

### 4. Obtaining & Installing the APK
Since the VM has no GUI, you must download the app on your laptop and upload it.

**A. Download the APK**
The emulator runs on **x86_64** architecture. Standard mobile APKs (ARM64) might crash or run slowly.
1.  Go to [APKMirror](https://www.apkmirror.com/) or [APKPure](https://apkpure.com/).
2.  Search for **"Tiket.com"**.
3.  **Crucial:** Download the version labeled **"Universal"** or **"x86_64"**.
    *   *Note:* `.apk` files are preferred. If you download an `.xapk` or `.apks` bundle, the script supports them, but they are larger.

**B. Upload to VM**
Run this command on your **Local Laptop**:
```bash
# Replace username and IP with your GCP details
gcloud compute scp /path/to/downloaded/tiket.apk YOUR_USERNAME@android-gemini-agent:~/
```

**C. Install on Android**
Back in your **VM Terminal**:
```bash
./scripts/install_app.sh tiket.apk
```

---

## 🏃‍♂️ Usage

Run the agent with a natural language goal.

```bash
# Ensure venv is active
source .venv/bin/activate

# Run the agent
python main.py "Open Tiket.com and find a hotel in Bali for tomorrow"
```

The agent will:
1.  Take a screenshot.
2.  Send it to Gemini.
3.  Execute ADB clicks/typing.
4.  Repeat until the task is done.

---

## 📱 Viewing the Screen (Scrcpy Guide)

Since the Android device runs on a headless Cloud VM, you need to mirror the screen to your **Local Laptop** to watch the AI work in real-time.

### Option A: Scrcpy (High Performance, Recommended)

**1. Install Scrcpy on your LOCAL Laptop**
*   **Mac:** `brew install scrcpy android-platform-tools`
*   **Windows:** Download from [GitHub](https://github.com/Genymobile/scrcpy).

**2. Create an SSH Tunnel**
Open a terminal on your **Local Laptop**. This bridges the VM's ADB port (6520) to your laptop.

```bash
# Replace username and IP with your VM details
gcloud compute ssh android-gemini-agent \
    --zone=us-central1-a \
    --ssh-flag="-L 6520:localhost:6520"
```
*Keep this terminal window open!*

**3. Connect & Launch**
Open a **second terminal** on your Local Laptop:

```bash
# Connect local ADB to the tunnel
adb connect localhost:6520

# Launch the viewer
scrcpy
```
A window will pop up showing the remote Android device.

---

### Option B: Browser Viewer (No Installation)

If you cannot install Scrcpy, use the web viewer built into the Docker container.

1.  **Tunnel the Web Port (6080):**
    On your **Local Laptop**:
    ```bash
    gcloud compute ssh android-gemini-agent \
        --zone=us-central1-a \
        --ssh-flag="-L 6080:localhost:6080"
    ```

2.  **Open Browser:**
    Go to `http://localhost:6080` in Chrome or Safari.

---

## 🐛 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **VM Manager not supported** | Your VM does not have Nested Virtualization. You must recreate the VM and check the box in "Advanced Options". |
| **ADB Connect Fails** | The container is still booting. Wait 1 minute and try `./scripts/start_android.sh` again. |
| **Agent is clicking wrong spots** | Run `adb shell wm size` inside the VM. Update the fallback resolution in `app/adb.py` if it doesn't match. |
| **App crashes on launch** | Use Android 11 (`docker-android:emulator_11.0`) instead of Android 14. Android 14 is unstable in some Docker environments. |
