# Deploy SportHub

SportHub terdiri dari dua bagian:

- `backend/` — Laravel 11 API (PHP 8.3, MySQL)
- `frontend/` — React + Vite (Node 20+)

## 1. Backend (Laravel)

```bash
cd backend

composer install --no-dev --optimize-autoloader

cp .env.example .env
php artisan key:generate
```

Isi `.env` untuk production:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.domainkamu.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sporthub
DB_USERNAME=sporthub
DB_PASSWORD=password-kuat

# origin frontend, pisahkan dengan koma
FRONTEND_URLS=https://domainkamu.com

LOG_LEVEL=warning
```

Lalu:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Arahkan document root web server ke `backend/public` (jangan ke root project), aktifkan HTTPS.

**Jangan jalankan `php artisan db:seed` di production** — seeder membuat akun demo dengan password `password`.

## 2. Frontend (Vite)

`VITE_API_URL` dibaca saat **build**, bukan runtime:

```bash
cd frontend

npm ci
VITE_API_URL=https://api.domainkamu.com/api npm run build
```

Hasil build ada di `frontend/dist/`. Sajikan lewat Nginx/static host, dan arahkan semua route SPA ke `index.html`:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Kalau frontend dan API beda domain, pastikan domain frontend ada di `FRONTEND_URLS` backend.

## 3. Checklist sebelum go-live

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] `APP_KEY` baru (jangan pakai key development)
- [ ] Password DB kuat, user DB bukan `root`
- [ ] `FRONTEND_URLS` berisi domain production (bukan localhost)
- [ ] HTTPS aktif di frontend dan API
- [ ] Akun demo (`admin@sporthub.test`, `user@sporthub.test`) dihapus atau password-nya diganti
- [ ] Gambar lapangan diganti dari `placehold.co` ke gambar asli
- [ ] Favicon diganti (sekarang masih bolt ungu, bukan lime SportHub)
- [ ] Backup database terjadwal
- [ ] Log Laravel termonitor (`storage/logs/laravel.log`)

## 4. Catatan pembayaran

Pembayaran saat ini **simulasi**: `POST /api/bookings/{id}/payment` langsung menandai booking `confirmed` dan payment `paid`, tanpa payment gateway.

Saat booking dibatalkan (oleh user maupun admin), payment yang sudah `paid` otomatis ditandai `refunded` + `refunded_at`, tapi **pengembalian dana aktual masih manual**. Kalau nanti pakai gateway (Midtrans/Xendit), alur refund harus dihubungkan ke API mereka.

## 5. Menjalankan di lokal

```bash
# terminal 1
cd backend && php artisan serve

# terminal 2
cd frontend && npm run dev
```

Frontend: `http://localhost:5173` — API: `http://127.0.0.1:8000`.
