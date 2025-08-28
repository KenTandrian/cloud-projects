import json
import random
from datetime import datetime, timedelta, timezone

# --- Configuration ---
EVENTS_TO_GENERATE = 1500
OUTPUT_FILE = 'data/user_events_supplemental.json'
# ---------------------

def generate_missing_events():
    """
    Generates a supplemental file containing only home-page-view events
    that conform to the original visitor ID persona structure.
    """
    print(f"--- Generating {EVENTS_TO_GENERATE} supplemental home-page-view events ---")
    
    all_events = []
    personas = ['tech', 'value', 'hedger']
    
    for i in range(EVENTS_TO_GENERATE):
        # Pick a random persona for each new "visitor"
        persona_choice = random.choice(personas)
        
        # Spread the events over the last 30 days to ensure they fall in the window
        event_date = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))
        event_timestamp_str = event_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        
        # Create unique visitor IDs that match the established pattern
        # We use a high index '100+i' to guarantee they don't collide
        # with any IDs from the main generation script.
        visitor_id = f"visitor-{persona_choice}-sup-{i}"
        
        event = {
            "eventType": "home-page-view",
            "visitorId": visitor_id,
            "eventTime": event_timestamp_str
        }
        all_events.append(event)

    # Save to the new supplemental file
    with open(OUTPUT_FILE, 'w') as f:
        for event in all_events:
            f.write(json.dumps(event) + '\n')
            
    print(f"✅ Success: File '{OUTPUT_FILE}' created with {len(all_events)} events using persona-based visitor IDs.")

if __name__ == '__main__':
    generate_missing_events()
