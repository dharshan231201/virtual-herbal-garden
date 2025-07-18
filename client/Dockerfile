# Stage 1: Build the React application
FROM node:20-alpine AS builder
ARG VITE_API_BASE_URL

WORKDIR /app/client
COPY . .
RUN npm install
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build

FROM nginx:alpine As Final
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




# # client/Dockerfile
# FROM node:18-alpine as builder

# # --- ADD THIS LINE TO DECLARE THE BUILD ARGUMENT ---
# ARG VITE_API_BASE_URL

# # Set the working directory to /app (the mounted project root)
# WORKDIR /app

# # Copy package.json and install dependencies
# # Note: The context is 'client', so COPY . /app/client copies the content of client/ to /app/client
# COPY package.json /app/client/package.json
# COPY package-lock.json /app/client/package-lock.json 

# WORKDIR /app/client 

# # Install dependencies
# RUN npm install

# # Copy the rest of the client application files
# COPY . .

# # Build the React application.
# # --- IMPORTANT: Pass the build arg as an environment variable to the build command ---
# RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build

# FROM nginx:stable-alpine as Final

# # Copy the built React app from the builder stage to Nginx's web root
# COPY --from=builder /app/client/dist /usr/share/nginx/html

# # Copy a custom Nginx configuration to handle routing
# # Make sure you have client/nginx.conf in your project.
# COPY nginx.conf /etc/nginx/nginx.conf

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]