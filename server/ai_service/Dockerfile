FROM python:3.10-alpine
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY ai_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY common/ /app/common/
COPY ai_service/ /app/ai_service/
ENV PYTHONPATH=/app
CMD ["uvicorn", "ai_service.main:app", "--host", "0.0.0.0", "--port", "8001"]