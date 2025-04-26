include .env

deploy:
	gcloud run deploy ai-image-cropper --source=. --project=${PROJECT_ID} --region=asia-southeast2 --allow-unauthenticated

start:
	python app.py
