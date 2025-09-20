GOOGLE_CLOUD_PROJECT = YOUR_GOOGLE_CLOUD_PROJECT_ID
GOOGLE_CLOUD_LOCATION = us-central1
AGENT_PATH = "hotel-agent-app/"
SERVICE_NAME = "hotels-service"
APP_NAME = "hotels-app"
GOOGLE_GENAI_USE_VERTEXAI = True

deploy:
	adk deploy cloud_run \
		--project=${GOOGLE_CLOUD_PROJECT} \
		--region=${GOOGLE_CLOUD_LOCATION} \
		--service_name=${SERVICE_NAME}  \
		--app_name=${APP_NAME} \
		--with_ui \
		${AGENT_PATH}

run:
	adk web
