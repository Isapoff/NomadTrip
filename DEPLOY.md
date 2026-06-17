# NOMADTRIP — Запуск и публикация для защиты ВКР

Система соответствует ВКР: 47 маршрутов, 100 объектов, 17 мест размещения,
27 критериев KGSTD-2025, трёхуровневый алгоритм WSM (фильтрация → профилирование
→ ранжирование), стек TypeScript + React + Hono + tRPC + Drizzle ORM + MySQL
(глава 2 и раздел 3.8 диплома).

---

## Вариант А. Публичная ссылка через Railway (рекомендуется, ~15 минут)

Комиссия сможет открыть сайт с любого устройства по ссылке вида
`https://nomadtrip-production.up.railway.app`.

1. Зарегистрируйтесь на https://railway.app (через GitHub).
2. Загрузите папку `app/` в новый GitHub-репозиторий
   (Dockerfile уже добавлен — Railway соберёт проект сам).
3. В Railway: **New Project → Deploy from GitHub repo** → выберите репозиторий.
4. В том же проекте: **+ New → Database → MySQL**. Railway создаст базу.
5. Откройте сервис приложения → **Variables** и добавьте:
   - `DATABASE_URL` = значение `MYSQL_URL` из созданной базы
     (Railway подставляет через Reference: `${{MySQL.MYSQL_URL}}`)
   - `APP_ID` = `nomadtrip`
   - `APP_SECRET` = любая случайная строка
6. После первого деплоя один раз заполните базу. В Railway откройте
   вкладку сервиса → **Settings → Deploy → Custom Start Command** временно
   поставьте:
   ```
   npx drizzle-kit push --force && npx tsx db/seed.ts && node dist/boot.js
   ```
   После успешного запуска верните команду на `node dist/boot.js`
   (иначе seed будет пытаться вставлять дубликаты — они пропускаются,
   но это лишние секунды на старте).
7. **Settings → Networking → Generate Domain** — это и есть ссылка для комиссии.

## Вариант Б. Локальный запуск + ссылка через ngrok (если защита завтра)

Подходит, если нет времени на облако: сайт работает на вашем ноутбуке,
а комиссия заходит по временной публичной ссылке.

1. Установите Node.js 20+ и MySQL (или MariaDB).
2. Создайте базу: `CREATE DATABASE nomadtrip;`
3. В папке `app/` создайте файл `.env`:
   ```
   APP_ID=nomadtrip
   APP_SECRET=secret-key
   DATABASE_URL=mysql://root:ПАРОЛЬ@127.0.0.1:3306/nomadtrip
   ```
4. Выполните:
   ```
   npm install
   npm run db:setup          # создаёт таблицы и заполняет 47+100+17+27 записей
   npm run build
   npm start                 # сайт на http://localhost:3000
   ```
   Если db:setup не сработал — есть запасной путь, готовый SQL-дамп:
   ```
   sudo mysql nomadtrip < db/nomadtrip_dump.sql
   ```
5. Публичная ссылка: установите ngrok (https://ngrok.com, бесплатно),
   затем `ngrok http 3000` — получите ссылку вида
   `https://xxxx.ngrok-free.app`, которую можно отправить комиссии.
   Ссылка живёт, пока работает ваш ноутбук и ngrok.

## Вариант В. Render.com + бесплатный MySQL (TiDB Cloud)

1. База: https://tidbcloud.com → Serverless (бесплатно) → создайте кластер,
   скопируйте строку подключения mysql://...
2. Render: New → Web Service → подключите GitHub-репозиторий,
   Environment = Docker, добавьте переменные как в варианте А.
3. Первый запуск с командой `npx drizzle-kit push --force && npx tsx db/seed.ts && node dist/boot.js`.

---

## Что проверить перед защитой (соответствие диплому)

| Раздел ВКР | Где смотреть на сайте |
|---|---|
| Анкета и подбор (2.4, 3.2) | страница «Квиз» → топ-5 с объяснениями и профилем |
| Карта Leaflet+OSM (2.5) | страница «Карта»: 47 маршрутов, 100 объектов |
| Конструктор маршрута | вкладка «Свой маршрут»: точки → расчёт цены и дней |
| KGSTD-2025 (2.6, 3.3) | страница «Гестхаусы»: 27 критериев, баллы /54, звёзды |
| База данных (3.1, 3.8) | MySQL + Drizzle, таблицы routes/objects/guesthouses/kgstd_criteria |
