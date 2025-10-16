FROM python:3.10-slim-buster
WORKDIR /app/server/   
COPY . /app/server/
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
WORKDIR /app
EXPOSE 8005
CMD ["newrelic-admin", "run-program", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8005", "--app-dir", "."]
#CMD ["python", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8005", "--app-dir", "."]
