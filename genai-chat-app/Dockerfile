FROM python:3.12.7-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

COPY . ./

RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8080
HEALTHCHECK CMD curl --fail http://localhost:8080/_stcore/health
ENTRYPOINT ["streamlit", "run", "chat_vertexai.py", "--server.port=8080", "--server.address=0.0.0.0"]
#--server.enableCORS=false
