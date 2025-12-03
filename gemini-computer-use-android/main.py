import sys

from google import genai
from google.genai import types
from google.genai.types import Content, Part

from app import adb, config, tools


def run_agent(task):
    print(f"\n--- STARTING TASK: {task} ---\n")
    
    # Initialize Client
    client = genai.Client(api_key=config.API_KEY)
    
    # Setup Config
    generation_config = types.GenerateContentConfig(
        system_instruction=config.SYSTEM_PROMPT,
        thinking_config=types.ThinkingConfig(include_thoughts=True),
        tools=tools.get_tool_declarations(client)
    )

    # Initial Context
    initial_png = adb.take_screenshot_bytes()
    contents = [Content(
        role="user",
        parts=[Part(text=task), Part.from_bytes(data=initial_png, mime_type="image/png")]
    )]

    try:
        MAX_TURNS = 25
        for turn in range(MAX_TURNS):
            print(f"\n----- TURN {turn+1} -----")

            resp = client.models.generate_content(
                model=config.MODEL_ID,
                contents=contents,
                config=generation_config,
            )
            cand = resp.candidates[0]
            contents.append(cand.content)

            # Print Thoughts/Text
            text_parts = [p.text for p in cand.content.parts if p.text]
            if text_parts:
                print(f"🤖 Gemini: {' '.join(text_parts)}")

            # Check if Done
            if not any(getattr(p, "function_call", None) for p in cand.content.parts):
                print("\n✅ Task Finished.")
                break

            # Execute
            print("▶ Executing actions…")
            action_results = tools.exec_calls(cand)

            # Respond with new Screenshot
            frs = tools.build_function_responses(action_results)
            contents.append(
                Content(role="user", parts=[Part(function_response=fr) for fr in frs])
            )
        else:
            print("\n⏹ Reached step limit. Stopping.")
    except Exception as e:
        print(f"❌ Critical Error: {e}")
    finally:
        print("--- SESSION ENDED ---")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        user_goal = input("Enter your goal: ")
    else:
        user_goal = sys.argv[1]

    run_agent(user_goal)
