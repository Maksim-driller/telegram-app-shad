# Настройка Telegram Mini App

## Что нужно сделать

После деплоя на Vercel нужно привязать приложение к Telegram боту через [@BotFather](https://t.me/botfather).

---

## Пошаговая инструкция

### Шаг 1: Получи ссылку из Vercel

После деплоя у тебя будет ссылка типа:

```
https://telegram-app-shad.vercel.app
```

**Важно:** Ссылка должна быть HTTPS (не HTTP). Vercel дает HTTPS автоматически.

### Шаг 2: Настрой через BotFather

1. **Открой [@BotFather](https://t.me/botfather)** в Telegram

2. **Отправь команду**:

   ```
   /newapp
   ```

3. **Выбери своего бота** из списка (или создай нового через `/newbot`)

4. **BotFather спросит название приложения**:

   ```
   Choose a title for your Mini App
   ```

   Ответь: `ШАД • Подготовка` (или любое другое название)

5. **BotFather спросит короткое описание**:

   ```
   Choose a short description for your Mini App
   ```

   Ответь: `Приложение для подготовки к ШАД` (или свое описание)

6. **BotFather спросит фото** (опционально):

   ```
   Send me a photo for your Mini App (or /skip)
   ```

   Можешь отправить картинку или написать `/skip`

7. **BotFather спросит gif** (опционально):

   ```
   Send me a GIF for your Mini App (or /skip)
   ```

   Напиши `/skip`

8. **BotFather спросит ссылку**:

   ```
   Send me the link to your Mini App
   ```

   **Вставь ссылку из Vercel:**

   ```
   https://telegram-app-shad.vercel.app
   ```

9. **BotFather спросит короткое имя** (опционально):

   ```
   Choose a short name for your Mini App (or /skip)
   ```

   Напиши `/skip` или придумай короткое имя

10. **Готово!** ✅
    BotFather создаст Mini App и даст тебе кнопку для открытия.

---

## Альтернативный способ (если уже есть бот)

Если у тебя уже есть бот и ты хочешь добавить Mini App:

1. Открой [@BotFather](https://t.me/botfather)
2. Отправь: `/mybots`
3. Выбери своего бота
4. Выбери: **"Bot Settings"** → **"Menu Button"**
5. Выбери: **"Configure menu button"**
6. Отправь ссылку: `https://telegram-app-shad.vercel.app`
7. Готово!

---

## Проверка работы

После настройки:

1. **Открой своего бота** в Telegram
2. **Нажми на кнопку меню** (или на кнопку внизу экрана, если настроил Menu Button)
3. **Должно открыться твое приложение!** 🎉

---

## Важные моменты

### ✅ Что должно быть:

- **HTTPS ссылка** (не HTTP) - Vercel дает HTTPS автоматически
- **Корректный домен** - ссылка должна быть доступна из интернета
- **Приложение должно работать** - проверь в браузере перед настройкой

### 🔍 Проверка перед настройкой:

1. Открой ссылку в браузере (с компьютера):
   ```
   https://telegram-app-shad.vercel.app
   ```
2. Убедись, что:
   - Страница загружается ✅
   - Нет ошибок в консоли (F12) ✅
   - Интерфейс отображается правильно ✅

### 🐛 Если не работает:

1. **Проверь ссылку**:

   - Должна начинаться с `https://`
   - Должна быть доступна из браузера

2. **Проверь настройки Vercel**:

   - Проект должен быть задеплоен
   - В логах деплоя не должно быть ошибок

3. **Проверь в Telegram**:
   - Бот должен быть активен
   - Mini App должна быть настроена через BotFather

---

## Обновление приложения

После каждого обновления кода:

1. **Запушь изменения в GitHub**
2. **Vercel автоматически пересоберет и задеплоит**
3. **Ссылка останется той же** - ничего менять в BotFather не нужно! ✅

BotFather использует ссылку, которую ты указал, поэтому новые версии будут автоматически доступны.

---

## Пример диалога с BotFather

```
Ты: /newapp

BotFather: Choose a bot to create a Mini App for.
[Выбираешь бота]

BotFather: Choose a title for your Mini App

Ты: ШАД • Подготовка

BotFather: Choose a short description for your Mini App

Ты: Приложение для подготовки к ШАД

BotFather: Send me a photo for your Mini App (or /skip)

Ты: /skip

BotFather: Send me the link to your Mini App

Ты: https://telegram-app-shad.vercel.app

BotFather: ✅ Mini App created! Your Mini App is ready to use.
```

Готово! 🚀
