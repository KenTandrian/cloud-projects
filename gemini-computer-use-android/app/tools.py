import time
from typing import Any, Dict, List, Optional

from google.genai import types

from app import adb, config

# --- 1. Python Implementations of Tools ---

def open_app(app_name: str, intent: Optional[str] = None) -> Dict[str, Any]:
    """Opens an app by name.

    Args:
        app_name: Name of the app to open (any string).
        intent: Optional deep-link or action to pass when launching, if the app supports it.

    Returns:
        JSON payload acknowledging the request (app name and optional intent).
    """
    app_name = app_name.lower()
    pkg = app_name
    
    if app_name in config.APP_LIST: pkg = config.APP_LIST[app_name]
    else: pkg = app_name

    adb.execute_cmd(f"monkey -p {pkg} -c android.intent.category.LAUNCHER 1")
    time.sleep(3)
    return {"status": "requested_open", "app_name": app_name, "intent": intent}

def close_app(app_name: str) -> Dict[str, Any]:
    """Closes an app by name.

    Args:
        app_name: Name of the app to close (any string).

    Returns:
        JSON payload acknowledging the request (package name).
    """
    app_name = app_name.lower()
    pkg = app_name

    if app_name in config.APP_LIST: pkg = config.APP_LIST[app_name]
    else: pkg = app_name

    print(f"   (Force stopping {pkg})")
    adb.execute_cmd(f"am force-stop {pkg}")
    return {"status": "requested_close", "app_name": app_name}

def long_press_at(x: int, y: int) -> Dict[str, int]:
    """Long-press at a specific screen coordinate.

    Args:
        x: X coordinate (absolute), scaled to the device screen width (pixels).
        y: Y coordinate (absolute), scaled to the device screen height (pixels).

    Returns:
        Object with the coordinates pressed and the duration used.
    """
    real_x, real_y = adb.denorm_x(x), adb.denorm_y(y)
    adb.execute_cmd(f"input swipe {real_x} {real_y} {real_x} {real_y} 1000")
    return {"x": x, "y": y}

def go_home() -> Dict[str, Any]:
    """Navigates to the device home screen.

    Returns:
        Object acknowledging the home request.
    """
    adb.execute_cmd("input keyevent KEYCODE_HOME")
    return {"status": "home_requested"}

# --- 2. The Execution Logic (Processor) ---

def exec_calls(candidate) -> List[tuple[str, Dict[str, Any]]]:
    """Parses Gemini response and runs ADB commands.

    Args:
        candidate: The candidate response from Gemini.

    Returns:
        List of tuples containing the function name and its result.
    """
    results = []
    function_calls = [p.function_call for p in candidate.content.parts if p.function_call]

    for call in function_calls:
        name = call.name
        args = dict(call.args or {})
        extra: Dict[str, Any] = {}

        # HITL: if step is "risky" — ask for confirmation
        if "safety_decision" in args:
            if not ask_confirmation(args["safety_decision"]):
                print("⛔ User denied. Stopping.")
                # Mark stop result with this step
                results.append((name, {"error": "user_denied"}))
                return results
            extra["safety_acknowledgement"] = "true"

        result = {}
        print(f"👉 ACTION: {name} {args}")

        try:
            # --- Native Computer Use Tools ---
            if name == "click_at":
                # Gemini sends 0-1000 coordinates; we scale to device pixels
                x, y = adb.denorm_x(args["x"]), adb.denorm_y(args["y"])
                adb.execute_cmd(f"input tap {x} {y}")
                result = {"status": "clicked", "x": x, "y": y}

            elif name == "type_text_at":
                # Usually involves clicking first, then typing
                x, y = adb.denorm_x(args["x"]), adb.denorm_y(args["y"])
                adb.execute_cmd(f"input tap {x} {y}")
                # ADB Input Sanatization
                text = args["text"].replace(" ", "%s").replace("'", "").replace('"', "")
                adb.execute_cmd(f"input text {text}")
                if args.get("press_enter", False):
                    adb.execute_cmd("input keyevent KEYCODE_ENTER")
                result = {"status": "typed", "text": args["text"]}

            elif name == "scroll_at":
                # ADB Swipe to scroll. 
                # Note: Dragging UP scrolls DOWN.
                x, y = adb.denorm_x(args["x"]), adb.denorm_y(args["y"])
                adb.execute_cmd(f"input swipe {x} {y+300} {x} {y-300} 300")
                result = {"status": "scrolled"}

            # --- Custom Tools ---
            elif name == "open_app":
                result = open_app(args["app_name"], args.get("intent"))
            elif name == "close_app":
                result = close_app(args["app_name"])
            elif name == "long_press_at":
                result = long_press_at(args["x"], args["y"])
            elif name == "go_home":
                result = go_home()
            elif name == "go_back":
                adb.execute_cmd("input keyevent KEYCODE_BACK")
                result = {"status": "back_requested"}
            elif name == "wait_5_seconds":
                time.sleep(5)
                result = {"status": "waited"}
            else:
                print(f"⚠️ Unimplemented: {name}")
                result = {"error": "not_implemented"}

            time.sleep(1.0) # Wait for UI
            
        except Exception as e:
            print(f"❌ Error: {e}")
            result = {"error": str(e)}

        results.append((name, result))

    return results

def build_function_responses(results) -> List[types.FunctionResponse]:
    """Bundles results with a fresh screenshot."""
    screenshot = adb.take_screenshot_bytes()
    url = ""
    responses: List[types.FunctionResponse] = []
    for name, payload in results:
        data = {"url": url, **payload}
        responses.append(types.FunctionResponse(
            name=name,
            response=data,
            parts=[types.FunctionResponsePart(
                inline_data=types.FunctionResponseBlob(mime_type="image/png", data=screenshot)
            )]
        ))
    return responses

def get_tool_declarations(client):
    """Returns the configuration for Gemini."""
    custom_tools = [
        types.FunctionDeclaration.from_callable(client=client, callable=open_app),
        types.FunctionDeclaration.from_callable(client=client, callable=close_app),
        types.FunctionDeclaration.from_callable(client=client, callable=long_press_at),
        types.FunctionDeclaration.from_callable(client=client, callable=go_home),
    ]
    
    return [
        types.Tool(
            computer_use=types.ComputerUse(
                environment=types.Environment.ENVIRONMENT_BROWSER,
                excluded_predefined_functions=config.EXCLUDED_PREDEFINED_FUNCTIONS,
            )
        ),
        types.Tool(function_declarations=custom_tools)
    ]
