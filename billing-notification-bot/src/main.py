import flask
import functions_framework
from services.billing_service import get_billing_data
from services.notification_service import dispatch_notifications


@functions_framework.http
def run(request: flask.Request) -> tuple[str, int]:
    try:
        billing_data = get_billing_data()

        if not billing_data:
            return "No billing data found for today.", 200

        dispatch_results = dispatch_notifications(billing_data)

        return f"Execution complete. Results: {dispatch_results}", 200

    except Exception as e:
        print(f"Error: {e}")
        return f"Job failed: {str(e)}", 500
