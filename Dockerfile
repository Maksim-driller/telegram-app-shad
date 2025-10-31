# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund --prefer-offline
COPY src ./src
COPY index.html vite.config.ts tsconfig*.json postcss.config.js tailwind.config.js ./
RUN npm run build

# Stage 2: serve static via nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
RUN sed -i 's/try_files \$uri \$uri\//try_files \$uri \/index.html/;' /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


