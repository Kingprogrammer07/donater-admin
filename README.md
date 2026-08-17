# Donater Admin

Donater'ning admin paneli. Alohida loyiha — backend boshqa repoda.

- **Topshiriq va dizayn qoidalari:** backend repodagi `docs/FRONTEND.md`
- **API kontrakti:** backend repodagi `docs/ADMIN-UI.md` — yagona haqiqat manbai
- **Backend:** https://github.com/Kingprogrammer07/donater (private)

## Ishga tushirish

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

Dev serverni tunnel (ngrok va shu kabi) orqali ochsangiz, o'sha hostni
`DEV_ALLOWED_HOSTS` ga bering — Vite boshqa hostdan kelgan so'rovni rad etadi,
va bu himoyani repoda wildcard bilan ochib qo'ymaymiz:

```bash
DEV_ALLOWED_HOSTS=quiet-fox-1234.ngrok-free.dev npm run dev
```

## Backend bilan ishlash

Backendni lokal ko'tarish (backend papkasida):

```bash
docker compose up -d
```

API `http://127.0.0.1:8000` da, admin API `/admin/api/v1` ostida.

API turlari **qo'lda yozilmaydi** — sxemadan generatsiya qilinadi:

```bash
openapi-typescript http://127.0.0.1:8000/admin/api/v1/system/openapi.json --header "Authorization: Bearer <token>" -o src/api/schema.d.ts
```

## Deploy

Build natijasi (`dist/`) backend konteyneriga `ADMIN_UI_DIR` orqali beriladi:
panel `/admin` da, API `/admin/api/v1` da — bir originda, CORS kerak emas.
