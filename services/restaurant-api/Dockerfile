FROM python:3.12-slim

WORKDIR /app

COPY ../../backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ../../backend/app ./app

EXPOSE 8002

CMD ["uvicorn", "app.main_restaurant:app", "--host", "0.0.0.0", "--port", "8002"]