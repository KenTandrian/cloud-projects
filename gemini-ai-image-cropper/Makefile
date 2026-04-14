include .env

deploy:
	gcloud run deploy ai-image-cropper --source=. --project=${PROJECT_ID} --region=asia-southeast2 --allow-unauthenticated

setup:
	python3 -m venv .venv
	source .venv/bin/activate
	pip install -r requirements.txt

start:
	python app.py
