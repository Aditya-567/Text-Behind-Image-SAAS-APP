# Stage 1: Build the Angular application
# Use a Node.js image to build the project. 'alpine' is a lightweight version.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configuration and install dependencies
# Using 'npm ci' is faster and more reliable for builds than 'npm install'
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production. The output will be in /app/dist/TBI-app
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:1.25-alpine

# Copy the built application from the 'builder' stage to Nginx's web server directory
COPY --from=builder /app/dist/tbi-app /usr/share/nginx/html

# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
