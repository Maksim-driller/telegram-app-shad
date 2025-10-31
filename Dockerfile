# Multi-stage build for Vite React app
# Stage 1: Build the application
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --verbose

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove unnecessary files to minimize image size
RUN rm -rf /usr/share/nginx/html/* \
    /var/cache/apk/* \
    /tmp/* \
    /etc/nginx/conf.d/default.conf \
    /usr/share/man \
    /usr/share/doc \
    /root/.cache \
    /var/lib/apk/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config with SPA support and gzip compression
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    gzip_min_length 1000; \
    gzip_comp_level 6; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
