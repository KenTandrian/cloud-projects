.PHONY: setup run

setup:
	@python -m venv .venv
	@source .venv/bin/activate
	@pip install -r requirements.txt

run:
	@python main.py "$(GOAL)"
