import re
import subprocess
import sys

# Cache screen size to avoid calling ADB every millisecond
_WIDTH = 0
_HEIGHT = 0

def get_screen_size():
    """Gets device resolution to scale coordinates correctly."""
    global _WIDTH, _HEIGHT
    if _WIDTH > 0: return _WIDTH, _HEIGHT
    
    try:
        output = subprocess.check_output(["adb", "shell", "wm", "size"]).decode()
        m = re.search(r"(\d+)x(\d+)", output)
        if m:
            _WIDTH, _HEIGHT = int(m.group(1)), int(m.group(2))
            print(f"📱 Detected Resolution: {_WIDTH}x{_HEIGHT}")
            return _WIDTH, _HEIGHT
    except Exception as e:
        print(f"⚠️ ADB Error: {e}")
    
    return 720, 1280 # Fallback

def execute_cmd(command):
    """Executes a raw ADB shell command."""
    subprocess.run(f"adb shell {command}", shell=True)

def take_screenshot_bytes():
    """Captures and returns image bytes."""
    subprocess.run(["adb", "shell", "screencap", "-p", "/sdcard/screen.png"], stderr=subprocess.DEVNULL)
    subprocess.run(["adb", "pull", "/sdcard/screen.png", "screen.png"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with open("screen.png", "rb") as f:
        return f.read()

# Coordinate normalization helpers
def denorm_x(x):
    """Converts a percentage to pixels."""
    w, _ = get_screen_size()
    return int(x * w / 1000)

def denorm_y(y):
    """Converts a percentage to pixels."""
    _, h = get_screen_size()
    return int(y * h / 1000)
