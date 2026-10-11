# Frontend Dockerfile (Vite React)
# Build the static assets and serve them via a lightweight nginx
FROM node:18-alpine AS builder
WORKDIR /app
# Install dependencies
COPY package*.json ./
RUN npm ci --only=production
# Copy source code
COPY . .
# Build the Vite app
RUN npm run build

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 (default for nginx)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
