# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app/client
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]