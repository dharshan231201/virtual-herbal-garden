# the lightweight base image for the react project
FROM node:20-alpine AS builder
# creating a directory called /app/client
WORKDIR /app/client
# copying all the contenets to the container
COPY . .
# installing all the requirements
RUN npm install
# building the client
RUN npm run build

# production image of the react project
FROM nginx:alpine As Final
# copying the files from the builded image to the new base images
COPY --from=builder /app/client/dist /usr/share/nginx/html
# copying the nginx file from local to the final image
COPY nginx.conf /etc/nginx/nginx.conf
#copy entrypoint.sh to the image to dynamically update the value 
COPY entrypoint.sh /docker-entrypoint.sh
# setting the permissions to the entrypoint.sh file
RUN chmod +x /docker-entrypoint.sh
# not useful but informing that we are exposing port 80
EXPOSE 80
# executes the command during building the container
ENTRYPOINT ["/docker-entrypoint.sh"]
# executes the ccmmand when container starts /after creating an image but the difference from entrypoint is it can be overrided
CMD ["nginx", "-g", "daemon off;"]