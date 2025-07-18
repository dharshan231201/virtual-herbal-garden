FROM python:3.10-slim-buster
WORKDIR /app/server/   
COPY . /app/server/
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
WORKDIR /app
EXPOSE 8005
CMD ["python", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8005", "--app-dir", "."]



# # server/Dockerfile
# FROM python:3.10-slim-buster

# # Set the working directory to /app (the root of your application inside the container)
# # This is where the mounted volume will appear.
# WORKDIR /app

# # Copy only the 'server' application files for the build image (before volumes override in compose)
# # The context is 'server', so '.' refers to the content of your host's 'server' folder.
# # We copy it into /app/server to maintain the 'server.main' package structure.
# COPY . /app/server/

# # Copy requirements.txt specifically for installation
# # It will be at /app/server/requirements.txt inside the container.
# COPY requirements.txt /app/server/requirements.txt

# # Install dependencies from the copied requirements.txt
# RUN pip install --no-cache-dir --upgrade pip setuptools wheel
# RUN pip install --no-cache-dir -r /app/server/requirements.txt

# EXPOSE 8005

# # Command to run the FastAPI application using Uvicorn
# # 'server.main:app' tells uvicorn to look for 'main.py' inside the 'server' package,
# # which is relative to the Python path (which includes /app due to WORKDIR).
# CMD ["python", "-m", "uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8005"]