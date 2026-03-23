FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces requires exposing port 7860
EXPOSE 7860

# Run Uvicorn on 7860
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]