FROM python:3.10-alpine
WORKDIR /app
RUN apk add --no-cache gcc musl-dev postgresql-dev
COPY plant_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY common/ /app/common/
COPY plant_service/ /app/plant_service/
ENV PYTHONPATH=/app
CMD ["uvicorn", "plant_service.main:app", "--host", "0.0.0.0", "--port", "8002"]