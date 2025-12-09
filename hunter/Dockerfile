FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all Python files
COPY config.py .
COPY main.py .

CMD ["python", "-u", "main.py"]

