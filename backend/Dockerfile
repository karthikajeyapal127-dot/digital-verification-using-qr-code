# Backend Dockerfile - Node.js Express REST API
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for optimal caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend REST port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start Express server
CMD ["node", "server.js"]
