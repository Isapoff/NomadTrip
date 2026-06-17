# NOMADTRIP — запуск локально и деплой на DigitalOcean

Это руководство доведено до состояния «комиссия заходит со своих телефонов и
ноутбуков по ссылке, и всё работает». Стек: React + Vite (фронт), Hono + tRPC
(API), Drizzle ORM + MySQL (данные). Один Node-процесс отдаёт и сайт, и API.

Содержание:
1. Что где лежит (быстрая карта проекта)
2. Локальный запуск — через Docker (проще всего)
3. Локальный запуск — без Docker
4. Вход в кабинет провайдера и админка
5. Деплой на DigitalOcean — App Platform + Managed MySQL (рекомендуется к защите)
6. Деплой на DigitalOcean — Droplet + Docker Compose (альтернатива)
7. Чек-лист перед защитой

---

## 1. Что где лежит

- `src/` — фронтенд (страницы, компоненты, кабинет провайдера и админка).
- `api/` — сервер: tRPC-роутеры, авторизация (`api/lib/auth.ts`), подключение к БД
  (`api/queries/connection.ts`), алгоритм подбора WSM (`api/lib/wsm.ts`).
- `db/schema.ts` — структура таблиц (routes, objects, guesthouses, providers и др.).
- `db/seed.ts` — наполнение: 47 маршрутов, 100 объектов, 17 мест размещения, 27 критериев.
- `db/seed-providers.ts` — учётные записи для входа в кабинет.
- `db/nomadtrip_dump.sql` — готовый SQL-дамп (запасной способ залить данные).
- `Dockerfile`, `docker-compose.yml` — контейнеризация.

Сами данные при работе сайта лежат **в MySQL**, на который указывает переменная
`DATABASE_URL`. Файлы `seed.ts`/`dump.sql` — это исходник, которым база наполняется.

---

## 2. Локальный запуск через Docker (рекомендуется)

Нужен только установленный Docker Desktop. В папке `app/`:

```bash
# 1. Создать файл .env
cat > .env << 'EOF'
APP_ID=nomadtrip
APP_SECRET=любая-длинная-случайная-строка
MYSQL_ROOT_PASSWORD=nomadroot
MYSQL_DATABASE=nomadtrip
EOF

# 2. Поднять приложение + базу
docker compose up -d --build

# 3. Один раз создать таблицы и наполнить данными (включая провайдеров)
docker compose exec app npm run db:push
docker compose exec app npm run db:seed
docker compose exec app npm run db:seed:providers
```

Сайт: http://localhost:3000 . Кабинет провайдера: http://localhost:3000/provider .
База живёт в Docker-томе `db_data` и переживает перезапуски.

Остановить: `docker compose down` (данные сохранятся). Полностью удалить с данными:
`docker compose down -v`.

---

## 3. Локальный запуск без Docker

Нужны Node.js 20+ и MySQL 8 (или MariaDB).

```bash
# 1. Создать базу в своём MySQL
mysql -u root -p -e "CREATE DATABASE nomadtrip;"

# 2. Файл .env в папке app/
cat > .env << 'EOF'
APP_ID=nomadtrip
APP_SECRET=любая-длинная-случайная-строка
DATABASE_URL=mysql://root:ВАШ_ПАРОЛЬ@127.0.0.1:3306/nomadtrip
EOF

# 3. Установка и наполнение
npm install
npm run db:setup            # создаёт таблицы + данные + провайдеров одной командой

# 4. Режим разработки (с hot-reload)
npm run dev                 # http://localhost:3000

# ИЛИ продакшен-сборка
npm run build
npm start
```

Если `db:setup` не сработал — запасной путь: `mysql nomadtrip < db/nomadtrip_dump.sql`,
затем `npm run db:seed:providers` для учётных записей.

---

## 4. Вход в кабинет и админка

Открыть `/provider` → форма входа.

| Логин   | Пароль      | Роль     |
|---------|-------------|----------|
| `admin` | `nomad2025` | admin    |
| `demo`  | `demo1234`  | provider |

После входа доступны вкладки **✎ Маршруты / ✎ Жильё / ✎ Объекты** — можно
добавлять, редактировать и удалять записи. Новые маршруты сразу появляются на
страницах сайта, на карте (по координатам и полю «ID объектов») и в подборе тура
(по оценкам 1–10). Подробнее — в `PROVIDER_AUTH.md`.

> Перед защитой смените пароли: отредактируйте `db/seed-providers.ts` и снова
> запустите `npm run db:seed:providers`.

---

## 5. DigitalOcean: App Platform + Managed MySQL (рекомендую к защите)

Самый надёжный путь: автоматический HTTPS, авто-перезапуск при сбое, публичная
ссылка вида `https://nomadtrip-xxxxx.ondigitalocean.app`. Платформа собирает проект
по вашему `Dockerfile`.

**Шаг 1. Код в GitHub.** Залейте папку `app/` в репозиторий на GitHub.

**Шаг 2. Создать App.** В DigitalOcean: **Create → Apps → GitHub** → выберите
репозиторий и ветку. DO обнаружит `Dockerfile` и предложит собрать по нему.
Приложение слушает `process.env.PORT`, поэтому порт подставится автоматически.

**Шаг 3. Добавить базу.** В том же приложении: **Create/Attach Database → MySQL**.
Для защиты достаточно «Dev Database» (дешевле) или Managed-кластера (надёжнее).

**Шаг 4. Переменные окружения** (App → Settings → App-Level Environment Variables):

```
APP_ID                       = nomadtrip
APP_SECRET                   = длинная-случайная-строка   (тип: Secret)
NODE_ENV                     = production
DATABASE_URL                 = ${db.DATABASE_URL}          (биндинг к компоненту БД)
DB_SSL                       = true
DB_SSL_REJECT_UNAUTHORIZED   = false
```

`DATABASE_URL = ${db.DATABASE_URL}` — это ссылка на присоединённую базу (`db` —
имя компонента БД в вашем приложении; подставьте фактическое). `DB_SSL=true`
обязателен: Managed MySQL принимает только TLS-подключения, иначе будет ошибка
соединения.

**Шаг 5. Первичное наполнение базы.** После первого успешного деплоя откройте
**Console** компонента приложения и выполните:

```bash
npm run db:push
npm run db:seed
npm run db:seed:providers
```

(Альтернатива: временно в **Settings → Commands → Run Command** поставить
`npm run db:push && npm run db:seed && npm run db:seed:providers && node dist/boot.js`,
дождаться запуска, затем вернуть команду на `node dist/boot.js`.)

**Шаг 6. Ссылка.** App → вкладка с доменом: там публичный `https`-адрес. Его и
открывает комиссия с любого устройства. HTTPS уже включён, сертификат
автоматический — на телефонах и ноутбуках ничего не «слетает».

При каждом `git push` в выбранную ветку приложение пересобирается и
перевыкатывается само.

---

## 6. DigitalOcean: Droplet + Docker Compose (альтернатива)

Дешевле и полностью под вашим контролем, но HTTPS и обновления настраиваете сами.

**Шаг 1.** Создайте Droplet с образом **Docker** (DigitalOcean Marketplace), самый
маленький тариф подойдёт. Зайдите по SSH.

**Шаг 2.** На сервере:

```bash
git clone <ваш-репозиторий> nomadtrip && cd nomadtrip/app

cat > .env << 'EOF'
APP_ID=nomadtrip
APP_SECRET=длинная-случайная-строка
MYSQL_ROOT_PASSWORD=надёжный-пароль
MYSQL_DATABASE=nomadtrip
EOF

docker compose up -d --build
docker compose exec app npm run db:push
docker compose exec app npm run db:seed
docker compose exec app npm run db:seed:providers
```

Сайт будет доступен на `http://<IP-дроплета>:3000`. Чтобы открыть на 80 порту,
поменяйте в `docker-compose.yml` строку портов на `"80:3000"`.

**Шаг 3 (HTTPS и домен).** Для защиты желательно доменное имя + сертификат.
Простой путь — Caddy как обратный прокси (автоматический Let's Encrypt):
направьте `ваш-домен` на IP дроплета и поставьте Caddy перед приложением. Без
домена комиссия зайдёт по `http://IP:3000`, но это менее «чисто» на телефонах.

---

## 7. Чек-лист перед защитой

- [ ] Открыть публичную ссылку с телефона и с ноутбука — проверить главную, карту,
      подбор тура, страницу жилья.
- [ ] Зайти в `/provider`, войти под `admin`, открыть вкладку «✎ Маршруты»,
      добавить тестовый маршрут с координатами и оценками — убедиться, что он
      появился на странице «Маршруты» и в подборе. Затем удалить его.
- [ ] Сменить пароли провайдеров на боевые (`db/seed-providers.ts` →
      `npm run db:seed:providers`) и задать длинный `APP_SECRET`.
- [ ] Убедиться, что HTTPS работает (адрес начинается с `https://`).
- [ ] На App Platform — проверить, что база присоединена и `DB_SSL=true`.
- [ ] Сделать резервную копию: данные можно выгрузить
      (`mysqldump` или через Drizzle Studio) на случай демонстрации офлайн.

Если на самой защите интернет нестабилен — запасной вариант: локальный запуск
(раздел 2 или 3) на вашем ноутбуке + туннель `ngrok http 3000`, чтобы получить
временную публичную ссылку.
