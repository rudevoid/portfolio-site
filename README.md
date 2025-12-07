# Roman Engineer — static site (RU)

Эта версия собрана как **RU-only** (другие языки — заглушки с `noindex`).

## Быстрый старт (Cloudflare Pages)
1. Загрузите содержимое папки `roman-engineer-2025/` в корень проекта Pages.
2. Build command не нужен (статический сайт).

## Что заменить перед публикацией
### 1) Контакты
В файлах:
- `index.html`
- `hr-short.html`

Найдите `mailto:roman@example.com` и замените на ваш реальный email.

Для Telegram/WhatsApp в блоке "Контакты" сейчас стоят заглушки (кнопки не ведут на мессенджер, а показывают подсказку).
Чтобы включить их — замените `href="#contact"` на реальные ссылки:
- Telegram: `https://t.me/<username>`
- WhatsApp: `https://wa.me/<phone>` (в международном формате без плюса)

### 2) Sitemap (по желанию)
Файл `sitemap.xml` содержит домен `https://example.invalid` (это намеренно несуществующий домен).
Перед тем как отправлять sitemap в Google/Yandex, замените `https://example.invalid` на ваш реальный домен.

## PWA / офлайн
- `sw.js` кэширует только статику и отдаёт `offline.html`, если сеть недоступна.
- SW регистрируется автоматически (кроме `file://`).
