import os

from dotenv import load_dotenv

load_dotenv()

# API & Model
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("❌ Error: GEMINI_API_KEY not found in .env")

MODEL_ID = "gemini-2.5-computer-use-preview-10-2025"

# App Specifics
PKG_CHROME = "com.android.chrome"
PKG_SETTINGS = "com.android.settings"
PKG_TIKET = "com.tiket.gits"

APP_LIST = {
    "chrome": PKG_CHROME,
    "settings": PKG_SETTINGS,
    "tiket": PKG_TIKET,
}

# Prompts
SYSTEM_PROMPT = f"""You are operating an Android phone. 
* To provide an answer, output it on a separate line.
* Scroll if you cannot see an element.
* Coordinates are 0-1000.
* Use 'open_app(app_name)' to launch an app.
* If your task is finished, use 'close_app' to exit the session.
* List of apps: {', '.join(APP_LIST.keys())}
* Do not open Chrome unless the native app is not available.
"""

EXCLUDED_PREDEFINED_FUNCTIONS = [
    "open_web_browser", "search", "navigate", "hover_at",
    "scroll_document", "go_forward", "key_combination", "drag_and_drop",
]
