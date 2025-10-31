# Static-only Dockerfile - build locally first: npm run build
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/* \
           /var/cache/apk/* \
           /tmp/* \
           /etc/nginx/conf.d/default.conf \
           /usr/share/man \
           /usr/share/doc \
           /root/.cache \
           /var/lib/apk/*
COPY dist /usr/share/nginx/html
RUN echo 'server{listen 80;root /usr/share/nginx/html;index index.html;location /{try_files $uri /index.html;}}' > /etc/nginx/conf.d/default.conf && \
    rm -rf /etc/nginx/conf.d/*.default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


