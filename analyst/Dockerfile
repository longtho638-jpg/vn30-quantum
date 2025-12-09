# VN30-Quantum Analyst Container
# Technical Analysis Brain

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY main.py .

# Run with unbuffered output
CMD ["python", "-u", "main.py"]
