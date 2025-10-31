# Как задеплоить на Vercel

## Способ 1: Через веб-интерфейс (самый простой) ⭐

### Шаг 1: Подготовь код на GitHub

1. **Создай репозиторий на GitHub** (если еще нет):
   - Зайди на https://github.com
   - Нажми "New repository"
   - Назови репозиторий (например, `telegram-app-shad`)
   - Создай репозиторий

2. **Запушь код в GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ТВОЙ_НИКНЕЙМ/telegram-app-shad.git
   git push -u origin main
   ```

### Шаг 2: Подключи проект к Vercel

1. **Зайди на Vercel**:
   - Открой https://vercel.com
   - Войди через GitHub (если первый раз - зарегистрируйся)

2. **Создай новый проект**:
   - Нажми кнопку **"Add New..."** → **"Project"**
   - Выбери свой репозиторий `telegram-app-shad`
   - Нажми **"Import"**

3. **Настройки проекта** (Vercel определит их автоматически из `vercel.json`):
   - **Framework Preset**: Vite (определится автоматически)
   - **Root Directory**: `./` (оставь как есть)
   - **Build Command**: `npm run build` (уже настроено)
   - **Output Directory**: `dist` (уже настроено)
   - **Install Command**: `npm install` (по умолчанию)

4. **Нажми "Deploy"** 🚀

5. **Жди сборки** (обычно 1-3 минуты)

6. **Готово!** После сборки получишь ссылку типа: `https://telegram-app-shad.vercel.app`

### Шаг 3: Обновление (при каждом изменении кода)

Просто запушь изменения в GitHub:
```bash
git add .
git commit -m "Описание изменений"
git push
```

Vercel автоматически задеплоит новую версию! ✨

---

## Способ 2: Через Vercel CLI (для продвинутых)

### Установка CLI

```bash
npm install -g vercel
```

### Деплой

```bash
# Первый раз (создаст проект)
vercel

# Последующие разы (обновит существующий проект)
vercel --prod
```

Следуй инструкциям в терминале - CLI задаст вопросы и настроит всё сам.

---

## Важные моменты

### ✅ Что уже настроено:

- `vercel.json` - конфигурация для Vercel
- Build команда: `npm run build`
- Output директория: `dist`
- SPA роутинг настроен

### 🔍 Проверка деплоя:

После деплоя открой ссылку и проверь:
- Страница загружается ✅
- Нет ошибок в консоли (F12) ✅
- Роутинг работает (переходы между страницами) ✅

### 🐛 Если что-то не работает:

1. **Проверь логи в Vercel**:
   - Зайди в проект на Vercel
   - Открой вкладку "Deployments"
   - Нажми на последний деплой
   - Посмотри логи сборки

2. **Проверь настройки**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Пересобери локально** (для проверки):
   ```bash
   npm run build
   ```
   Если локально работает, значит проблема в настройках Vercel.

---

## Быстрая команда для первого деплоя

Если код уже на GitHub:

1. Зайди на https://vercel.com
2. Нажми "Add New..." → "Project"
3. Выбери репозиторий
4. Нажми "Deploy"
5. Готово! 🎉

---

## Получение ссылки для Telegram Mini App

После деплоя:
1. Скопируй ссылку из Vercel (типа `https://telegram-app-shad.vercel.app`)
2. Используй её в настройках Telegram Bot через [@BotFather](https://t.me/botfather)
3. Команда: `/newapp` → выбери бота → вставь ссылку

Готово! Приложение будет доступно в Telegram! 🚀

