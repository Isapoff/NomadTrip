# Деплой NOMADTRIP на DigitalOcean

Приложение — это **один web-сервис** (Node слушает `PORT`, раздаёт фронт из
`dist/public` и API на `/api/trpc`) плюс **одна база MySQL**. Ниже два пути:

- **Вариант A — App Platform** (PaaS, без сервера, ~20 мин). Проще, дороже.
- **Вариант B — Droplet + Docker Compose** (свой VPS). Дешевле, чуть больше ручной работы.

Перед любым вариантом: залейте папку `app/` в GitHub-репозиторий.

---

## Вариант A. App Platform + Managed MySQL

1. **Создайте приложение.** DigitalOcean → Apps → **Create App** → источник GitHub,
   выберите репозиторий. DO найдёт `Dockerfile` и соберёт контейнер автоматически.
2. **Тип ресурса — Web Service.** HTTP-порт оставьте `3000` (или любой — DO передаёт
   свой `PORT`, приложение его читает). Health check можно указать путь `/` (GET).
3. **Добавьте базу.** В том же приложении → **Create/Attach Database** →
   **Dev Database (MySQL)** для теста или **Managed MySQL** для прода.
4. **Переменные окружения** (App-level, вкладка Settings → App-Level Environment Variables):
   - `DATABASE_URL` — привяжите к базе. DO даёт переменную-биндинг вида
     `${db.DATABASE_URL}` (имя компонента БД вместо `db`). Это полная строка
     `mysql://...`.
   - `APP_ID` = `nomadtrip`
   - `APP_SECRET` = длинная случайная строка (используется для подписи сессий
     провайдеров — сгенерируйте, например, `openssl rand -hex 32`)
   - `NODE_ENV` = `production`
5. **Деплой.** Нажмите Deploy. После сборки приложение получит https-домен
   вида `https://nomadtrip-xxxxx.ondigitalocean.app`.
6. **Инициализация базы (один раз).** Откройте Console у web-компонента
   (вкладка Console) и выполните:
   ```
   npm run db:push            # создаёт таблицы (включая providers)
   npm run db:seed            # 47 маршрутов / 100 объектов / 17 гестхаусов / 27 критериев
   npm run db:seed:providers  # учётки кабинета: admin/nomad2025, demo/demo1234
   ```
   Если в Console нет dev-зависимостей (drizzle-kit/tsx ставятся в build-стейдже),
   используйте запасной дамп через клиент managed-базы:
   `mysql -h HOST -P 25060 -u doadmin -p defaultdb < db/nomadtrip_dump.sql`,
   а провайдеров добавьте через `db:seed:providers` локально с тем же `DATABASE_URL`.

### Важно про SSL (Managed MySQL)

DO Managed MySQL **требует SSL**. Строка от DO обычно содержит `?ssl-mode=REQUIRED`.
Если при старте ловите ошибку соединения/SSL — добавьте в конец `DATABASE_URL`
параметр `?ssl-mode=REQUIRED`, либо включите SSL в коде: в
`api/queries/connection.ts` передайте драйверу объект
`{ ssl: { rejectUnauthorized: true } }`. С Dev Database (тот же VPC) проблемы
обычно нет.

---

## Вариант B. Droplet + Docker Compose

Здесь база живёт в контейнере рядом с приложением (без SSL-нюансов).

1. **Создайте Droplet.** Ubuntu 24.04, минимум 1 GB RAM (лучше 2 GB —
   сборка фронта тяжеловата). Добавьте свой SSH-ключ.
2. **Поставьте Docker:**
   ```bash
   ssh root@ВАШ_IP
   apt update && apt install -y docker.io docker-compose-plugin git
   ```
3. **Заберите код и задайте секреты:**
   ```bash
   git clone https://github.com/ВЫ/ВАШ_РЕПО.git
   cd ВАШ_РЕПО/app          # путь до папки с docker-compose.yml
   cat > .env << 'EOF'
   APP_ID=nomadtrip
   APP_SECRET=ЗАМЕНИТЕ_НА_СЛУЧАЙНУЮ_СТРОКУ
   MYSQL_ROOT_PASSWORD=ЗАМЕНИТЕ_ПАРОЛЬ
   MYSQL_DATABASE=nomadtrip
   EOF
   ```
4. **Соберите и поднимите:**
   ```bash
   docker compose up -d --build
   ```
   `docker-compose.yml` поднимет MySQL (с healthcheck) и приложение, которое
   стартует только после готовности базы. Приложение — на порту `3000`.
5. **Инициализируйте базу (один раз):**
   ```bash
   docker compose exec app npm run db:push
   docker compose exec app npm run db:seed
   docker compose exec app npm run db:seed:providers
   ```
   Если dev-зависимостей в рантайм-образе нет, залейте дамп:
   ```bash
   docker compose exec -T db mysql -uroot -pПАРОЛЬ nomadtrip < db/nomadtrip_dump.sql
   ```
6. **HTTPS и домен.** Поставьте Caddy как реверс-прокси (сам получит сертификат):
   ```bash
   apt install -y caddy
   ```
   В `/etc/caddy/Caddyfile`:
   ```
   ваш-домен.ru {
       reverse_proxy localhost:3000
   }
   ```
   ```bash
   systemctl reload caddy
   ```
   Наведите A-запись домена на IP дроплета. Без домена сайт доступен по
   `http://ВАШ_IP:3000` (откройте порт: `ufw allow 3000`).

### Обновление версии

```bash
git pull
docker compose up -d --build
```

---

## Сводка переменных окружения

| Переменная     | Назначение                                            |
|----------------|-------------------------------------------------------|
| `DATABASE_URL` | строка подключения MySQL (`mysql://user:pass@host:port/db`) |
| `APP_ID`       | идентификатор приложения (`nomadtrip`)                |
| `APP_SECRET`   | секрет для подписи сессий провайдеров (случайная строка) |
| `NODE_ENV`     | `production` в проде                                  |
| `PORT`         | порт сервера (по умолчанию 3000; App Platform задаёт свой) |

После деплоя кабинет провайдера — на `/provider`, вход `admin / nomad2025`
(смените пароль через `db/seed-providers.ts`).
