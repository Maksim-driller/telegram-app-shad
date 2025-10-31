# Build stage
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline && npm cache clean --force
COPY src ./src
COPY index.html vite.config.ts tsconfig*.json postcss.config.js tailwind.config.js ./
RUN npm run build

# Final stage - minimal nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/* \
           /var/cache/apk/* \
           /tmp/* \
           /etc/nginx/conf.d/default.conf \
           /usr/share/man \
           /usr/share/doc \
           /root/.cache
COPY --from=builder /build/dist /usr/share/nginx/html
RUN echo 'server{listen 80;root /usr/share/nginx/html;index index.html;location /{try_files $uri /index.html;}}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


