# Инструкция по деплою

## Multi-stage Dockerfile

Проект использует multi-stage Dockerfile, который автоматически собирает приложение внутри контейнера. Это позволяет деплоить на любые платформы (Railway, Render, Fly.io и т.д.) без предварительной локальной сборки.

## Автоматический деплой

Dockerfile состоит из двух стадий:
1. **Builder stage** - собирает приложение (node:22-slim)
2. **Production stage** - сервит статические файлы через nginx (nginx:alpine)

Только финальный образ попадает в production, поэтому размер минимальный (~10-15MB).

## Локальная сборка (опционально)

Если хочешь собрать локально перед деплоем:

```bash
npm install
npm run build
docker build -t telegram-app-shad .
```

Но это не обязательно - Dockerfile автоматически соберет проект при `docker build`.

## Проверка размера

После сборки проверь размер образа:

```bash
docker images telegram-app-shad
```

Должен быть ~10-15MB (только nginx:alpine + dist)

## Размеры:

- `dist/`: ~672KB (только статика)
- Финальный Docker образ: ~10-15MB (nginx:alpine + dist)
- Builder stage НЕ попадает в финальный образ благодаря multi-stage build
