# Backend Dockerfile
# Use a lightweight Node.js image
FROM node:18-alpine AS builder
WORKDIR /app
# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production
# Copy source code
COPY . .
# Expose the port the server runs on
EXPOSE 5000
# Start the server
CMD ["node","server.js"]
