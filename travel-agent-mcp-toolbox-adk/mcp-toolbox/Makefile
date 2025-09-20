IMAGE = us-central1-docker.pkg.dev/database-toolbox/toolbox/toolbox:latest

deploy:
	gcloud run deploy hotels-mcp-toolbox \
		--image ${IMAGE} \
		--service-account mcp-toolbox \
		--region us-central1 \
		--set-secrets "/app/tools.yaml=tools:latest" \
		--args="--tools_file=/app/tools.yaml","--address=0.0.0.0","--port=8080" \
		--allow-unauthenticated

run:
	./toolbox --tools-file "tools.yaml"
