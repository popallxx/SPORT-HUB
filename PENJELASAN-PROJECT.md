# SportHub — Dokumentasi Proyek

> **SportHub** adalah aplikasi web (web app) penyewaan lapangan olahraga.
> Pelanggan dapat memilih lapangan, melihat jadwal jam kosong (slot), melakukan booking, dan menyelesaikan pembayaran — semua secara online.
> Proyek ini berbasis **Laravel (backend/API)** + **React (frontend)**.

---

## 1. Gambaran Umum

SportHub adalah platform booking fasilitas olahraga dengan konsep **1 lokasi olahraga** yang menyediakan minimal **2 lapangan**:

| Lapangan | Jenis Olahraga |
|----------|----------------|
| Lapangan 1 | Badminton |
| Lapangan 2 | Futsal |

Aplikasi memiliki **2 peran (role) pengguna**:

| Role  | Kemampuan |
|-------|-----------|
| **User** | Melihat lapangan, booking, membayar, melihat riwayat booking |
| **Admin** | Mengelola lapangan, booking, dan pengguna + melihat statistik dashboard |

---

## 2. Teknologi yang Digunakan

| Lapisan | Teknologi |
|---------|-----------|
| Backend (REST API) | Laravel 11 (PHP) |
| Frontend | React 19 + Vite (JavaScript, bukan TypeScript) |
| Routing Frontend | React Router DOM v7 |
| HTTP Client | Axios |
| Styling | Bootstrap 5.3 + Custom CSS Design System |
| Database | MySQL |
| Autentikasi | Laravel Sanctum (token API) |
| Font | Inter (Google Fonts) |

**Ruang lingkup pekerjaan:** fokus utama yang sedang dikerjakan adalah **redesign seluruh UI/UX frontend** tanpa menyentuh logika backend, API, maupun database.

---

## 3. Arsitektur Aplikasi (Alur Kerja)

```
Browser (React)  ──HTTP──►  Laravel REST API  ──►  MySQL
     │                        (routes/api.php)
     │
  React Router
     │
  Pages ──► Components ──► Axios ──► formats (utils)
```

Alur sederhana:

1. **React** merender halaman.
2. Halaman memanggil file `src/services/api.js` (Axios).
3. Axios mengirim request ke backend di `http://127.0.0.1:8000/api`.
4. Laravel memproses (validasi, autentikasi Sanctum, query database).
5. Laravel mengembalikan response JSON.
6. React menampilkan data (dengan fallback untuk loading/empty/error).

> **Penting:** React **tidak menyimpan data usahanya (hardcode)**. Semua data lapangan, harga, status, dan booking diambil dari API Laravel.

---

## 4. Struktur Backend (Laravel)

Hanya ringkasan — bagian ini **tidak diubah** dalam proses redesign.

### Rute API utama (`backend/routes/api.php`)

**Publik (tanpa login):**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/register` | Daftar akun baru |
| POST | `/api/login` | Login user |
| GET | `/api/courts` | Daftar lapangan aktif |
| GET | `/api/courts/{id}` | Detail satu lapangan |
| GET | `/api/courts/{id}/slots?date=` | Cek ketersediaan jam per tanggal |

**Perlu autentikasi (login):**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/user` | Data user yang login |
| POST | `/api/logout` | Logout |
| GET | `/api/bookings` | Riwayat booking milik user |
| POST | `/api/bookings` | Membuat booking baru |
| GET | `/api/bookings/{id}` | Detail booking |
| DELETE | `/api/bookings/{id}` | Membatalkan booking |
| POST | `/api/bookings/{id}/payment` | Melakukan pembayaran |

**Admin (login + role admin):**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/admin/dashboard` | Statistik (jumlah user, court, booking, dll) |
| GET/POST | `/api/admin/courts` | Lihat/tambah lapangan |
| PUT/DELETE | `/api/admin/courts/{id}` | Ubah/hapus lapangan |
| GET / PUT | `/api/admin/bookings` | Lihat/ubah status booking |
| GET / PUT | `/api/admin/users` | Lihat/ubah role pengguna |

### Tabel database

Secara garis besar terdapat tabel: `users`, `courts`, `bookings`, `payments`.

- **users** → `name`, `email`, `password`, `role` (user/admin)
- **courts** → `name`, `type` (badminton/futsal), `price`, `description`, `image`, `status`
- **bookings** → `user_id`, `court_id`, `booking_date`, `start_time`, `end_time`, `total_price`, `status`, `booking_code`
- **payments** → `booking_id`, `payment_method`, `payment_status`

Status booking: `pending` (bayar) → `confirmed` → `completed`, atau `cancelled`.

---

## 5. Struktur Frontend (Hasil Redesign)

```
frontend/
├─ index.html
├─ src/
│  ├─ main.jsx               # entry point, memuat Bootstrap + index.css
│  ├─ App.jsx                # konfigurasi semua rute (React Router)
│  ├─ index.css              # DESIGN SYSTEM lengkap (theme dark sporty)
│  ├─ context/
│  │  └─ AuthContext.jsx     # state login/logout/register (menyimpan token & user)
│  ├─ services/
│  │  └─ api.js              # konfigurasi Axios + interceptor token & error 401
│  ├─ utils/
│  │  └─ format.js           # format harga/date/waktu/status/greeting
│  ├─ components/            # komponen reusable
│  │  ├─ PublicLayout, Navbar, Footer
│  │  ├─ Sidebar (admin), AuthLayout (login/register)
│  │  ├─ CourtCard, CourtImage, StatusBadge, StatCard, PageHeader
│  │  ├─ EmptyState, ErrorState, Skeleton, Loading, Modal
│  │  ├─ Icon, DatePicker, TimeSlotGrid, BookingSummary
│  │  └─ ProtectedRoute
│  └─ pages/
│     ├─ Home, Courts, CourtDetail, Booking
│     ├─ MyBookings, BookingDetail, Payment, Profile
│     ├─ Login, Register
│     └─ admin/ (AdminLayout, Dashboard, Courts, Bookings, Users)
```

---

## 6. Design System (Identitas Visual)

Prinsip tujuan desain: **SPORTY, PREMIUM, MODERN, DYNAMIC, CLEAN.**

### Palet warna

| Nama | Kode | Penggunaan |
|------|------|-----------|
| Background utama | `#0B0F14` | Latar seluruh halaman (hitam gelap) |
| Surface | `#111820` | Panel/bagian pendukung |
| Card | `#151D26` | Kartu konten |
| Card hover | `#1B2632` | Kartu saat disorot mouse |
| **Primary accent** | `#B8FF3D` | CTA, aktif, dipilih, highlight (hijau limau) |
| Secondary accent | `#8EDB2E` | Variasi hijau |
| Text utama | `#F5F7FA` | Tulisan utama |
| Text secondary | `#A7B0BA` | Tulisan keterangan |
| Border | `#27313C` | Garis tepi |
| Success / Warning / Danger / Info | `#35D07F` `#FFB547` `#FF5C5C` `#4DA3FF` | Status & badge |

Warna hijau digunakan **secara terkontrol**: CTA, status aktif, statistik penting, dan slot jam yang tersedia — bukan membanjiri seluruh halaman. Identitas utama tetap **dark background**.

### Tipografi

- Font: **Inter** (Google Fonts), tebal 400–900.
- Heading besar, bold, line-height rapat; hierarki jelas `H1 > H2 > H3 > body > caption`.
- Hero judul sangat besar, mis. **"BOOK YOUR GAME. PLAY YOUR BEST."**

### Ukuran (spacing & radius)

- Container maksimal ±1320px.
- Radius konsisten: kecil `8px`, sedang `12px`, besar `16px`.
- Bentuk *pill* hanya dipakai untuk badge/status, bukan semua elemen.

---

## 7. Fitur Visual Baru (Hasil Redesign)

Fitur yang sebelumnya polos/template Boostrap kini dijadikan modern:

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Warna | Biru default Bootstrap | Dark premium + accent hijau limau |
| Hero | Gambar Unsplash + teks tengah | Visual placeholder sporty + headline besar (tanpa gambar eksternal) |
| Placeholder gambar | `placehold.co` | Placeholder premium (gradient + garis lapangan + ikon) |
| Loading | Spinner teks "Loading..." | **Skeleton shimmer** sesuai bentuk konten |
| Empty | Teks "Data tidak tersedia" | Empty state dengan ikon + tombol aksi |
| Error | Teks merah mentah | Error state profesional + tombol "Try Again" |
| Admin | Card + tabel CRUD biasa | **Sidebar kiri** + dashboard statistik + grafik aktivitas |
| Booking | Form panjang satu kolom | Calendar bulan + grid jam + ringkasan di panel terpisah |
| Navbar | Statis | Sticky/translucent dengan logo & menu aktif ber-warna accent |

### Komponen reusable

Dibuat sebagai komponen agar tidak duplikasi:

- `CourtCard` — kartu lapangan (dipakai Home, Courts, Admin)
- `CourtImage` — otomatis memakai foto `court.image`, jika kosong → placeholder
- `StatusBadge` — badge status berwarna (pending/conformed/completed/cancelled)
- `StatCard` — kartu angka statistik besar
- `Skeleton` — 4 variasi loading (card, stat, tabel, list)
- `EmptyState` / `ErrorState` / `Modal` — state & dialog reusable
- `DatePicker` + `TimeSlotGrid` — kalender & slot jam untuk booking
- `BookingSummary` — ringkasan booking + total harga

---

## 8. Penjelasan Per Halaman

### Halaman Publik

**Home `/`**
- Hero: kiri = eyebrow "SPORT FACILITY BOOKING", judul besar, subjudul, tombol CTA.
- Kanan = visual placeholder premium (lingkaran berputar, garis lapangan, chip statistik).
- Section **OUR COURTS** — data dari API `/courts` ditampilkan sebagai kartu.
- Section *How it works* — 3 langkah memilih lapangan → pilih jam → main.

**Courts `/courts`**
- Daftar semua lapangan dalam grid kartu (skeleton saat loading, empty state jika kosong).

**Court Detail `/courts/:id`**
- Kiri: foto/placeholder besar. Kanan: tipe olahraga, nama, harga besar ber-warna accent, deskripsi, status, tombol **BOOK THIS COURT**.

**Login `/login` & Register `/register`**
- Tampilan *split screen*: kiri area branding olahraga, kanan form.
- Form: email + password (login); nama + email + password + konfirmasi (register).
- Validasi error ditampilkan rapi di atas form.

### Halaman User (perlu login)

**Booking `/booking?court=1`**
1. Pilih lapangan (jika belum lewat URL).
2. **Calendar** — pilih tanggal (hari lampau otomatis disabled).
3. **Time slot** — grid jam 07:00–21:00; hijau = tersedia, redup = sudah terpakai/lewat, hijau solid = dipilih.
4. **Durasi** — pilih 1–3 jam.
5. **Booking Summary** — ringkasan + total harga + tombol **CONTINUE TO PAYMENT**.
6. Cara kerjanya: Cek slot memakai API `/courts/{id}/slots?date=`; setelah submit, POST `/bookings` lalu diarahkan ke halaman pembayaran.

**My Bookings / Dashboards User `/bookings`**
- Sapaan otomatis sesuai waktu ("Good Morning/Afternoon/Evening, ...").
- 3 statistik: **Active Bookings**, **Total Bookings**, **Upcoming Game**.
- Kartu besar **UPCOMING BOOKING** dengan tombol lihat detail.
- Tabel **Recent Bookings** (di mobile berubah jadi kartu).

**Booking Detail `/bookings/:id`**
- Kode booking, status badge, info lapangan/tanggal/jam/total, info pembayaran.
- Jika status masih `pending` → tombol lanjut ke pembayaran.

**Payment `/bookings/:id/payment`**
- Kiri: ringkasan pesanan. Kanan: pilih metode (QRIS / Transfer / Cash) + tombol bayar.
- Setelah bayar, status booking menjadi `confirmed`.

**Profile `/profile`**
- Avatar (inisial), nama, email, role, tombol ke riwayat booking & admin.

### Halaman Admin (role admin)

**Dasar** — semua halaman admin memakai **sidebar kiri** (Dashboard, Courts, Bookings, Users, Logout). Di layar kecil sidebar berubah jadi menu geser.

**Admin Dashboard `/admin`**
- Sapaan + **SPORT HUB OVERVIEW**.
- 4 kartu statistik besar: Total Bookings, Total Users, Total Courts, Pending Bookings.
- **Booking Activity** — grafik batang 7 hari terakhir (dihitung dari data API di frontend, tanpa library tambahan).
- **Booking Status** — bar distribusi confirmed/completed/cancelled.
- **TODAY'S BOOKINGS** — tabel booking hari ini + dropdown ubah status.

**Admin Courts `/admin/courts`**
- Grid kartu lapangan (foto, nama, tipe, harga, status, tombol Edit/Delete).
- Modal form untuk tambah/edit lapangan (nama, tipe, harga, deskripsi, URL gambar, status).

**Admin Bookings `/admin/bookings`**
- Filter pill: All / Pending / Confirmed / Completed / Cancelled.
- Tabel lengkap (desktop) yang berubah jadi kartu (mobile) + ubah status.

**Admin Users `/admin/users`**
- Tabel: nama, email, role, tanggal bergabung, total booking, dropdown ubah role.

---

## 9. Autentikasi (Laravel Sanctum)

1. Saat login/register, backend mengembalikan **token API** + data user.
2. Token disimpan di `localStorage` browser.
3. `AuthContext` menyimpan status login: siapa user-nya (dipakai semua halaman & navbar).
4. `api.js` (Axios) otomatis menyisipkan header `Authorization: Bearer <token>` di tiap request.
5. Jika API balas **401 (unauthorized)**, token otomatis dihapus dan pengguna diarahkan ke halaman login.
6. `ProtectedRoute` melindungi halaman: belum login → dibawa ke `/login`; bukan admin akses `/admin` → kembali ke beranda.

---

## 10. Pola Penanganan di Frontend (Loading / Empty / Error)

Setiap halaman yang mengambil data API menerapkan 3 kondisi:

1. **Loading** → skeleton mengikuti bentuk konten (kartu, statistik, tabel).
2. **Error** → "Something went wrong / Gagal memuat" + tombol **Try Again** (tanpa menampilkan pesan teknis mentah ke pengguna; detail tetap di console untuk developer).
3. **Empty** → ikon + judul + deskripsi ramah + tombol aksi (mis. "BOOK A COURT").

Contoh nyata empty state di Home: "NO COURTS AVAILABLE — There are no courts available right now." dengan tombol Refresh.

---

## 11. Responsive Design

- **Desktop:** sidebar penuh, grid kartu 3–4 kolom, hero lebar.
- **Tablet:** kartu 2 kolom, sidebar bisa disembunyikan.
- **Mobile:** navbar jadi hamburger, kartu 1 kolom, booking jadi 1 kolom, tabel admin berubah jadi **kartu**, tanpa scroll horizontal.

Semua toggle navigasi memakai `aria-label`, gambar memakai `alt`, form punya label, dan fokus keyboard bisa terlihat (accessibility).

---

## 12. Mengulik ke Dapur (Detail Teknis yang Sering Ditanya Guru)

### Bagaimana Cek Slot Jam Bekerja?
Backend mengirim slot per jam dari `07:00` sampai `21:00`. Setiap slot punya 3 status:
- `available` = belum dibooking
- `past` = jam sudah lewat di hari ini → otomatis disabled
- kombinasinya → slot dianggap tidak bisa dipilih

Frontend mewarnai: tersedia = outline hijau, dipilih = hijau solid, tidak tersedia = redup/strip.

### Bagaimana Harga Total Dihitung?
`Harga/jam lapangan × jumlah jam dipilih`. Dihitung cukup di sisi frontend untuk ditampilkan, tetapi **nilai akhir dihitung ulang oleh backend** saat booking dibuat (agar tidak bisa disalahgunakan).

### Bagaimana Gambar Dikelola?
API mengembalikan kolom `court.image` (URL). Komponen `CourtImage`:
- Jika `image` ada dan valid → ditampilkan.
- Jika kosong/null/gagal dimuat → otomatis menampilkan **placeholder premium** (gradient + garis lapangan + ikon olahraga).
Jadi desain sudah siap menerima foto asli nanti tanpa mengubah kode.

### Kenapa Tidak Menambah Library Chart/Ikon?
Sesuai kaidah proyek (tanpa menambah dependency baru tanpa alasan), grafik aktivitas dibuat dengan **CSS murni** dan ikon memakai **inline SVG** buatan sendiri.

### Kendala yang Pernah Ditemui
- Dev server Vite sempat diterminasi oleh terminal (timeout) sehingga link localhost tidak terbuka → solusi: menjalankan Vite langsung lewat binary `node` sebagai proses terpisah (background).
- Rule lint `react-hooks` sempat menolak pola `useEffect` yang langsung memanggil setState → diperbaiki dengan memindahkan `setState` ke dalam callback promise.
- Tampilan lama memakai gambar eksternal (Unsplash/placehold.co) → diganti placeholder lokal agar independen dari internet.

---

## 13. Cara Menjalankan Proyek

### 1) Jalankan Backend (Laravel + Laragon)
- Pastikan MySQL menyala di Laragon.
- Buka project `backend`, jalankan:
```bash
php artisan serve
```
(atau pakai virtual host Laragon). API berjalan di `http://127.0.0.1:8000/api`.

### 2) Jalankan Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Buka **http://localhost:5173**.

Konfigurasi URL API ada di `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3) Verifikasi kualitas kode
```bash
cd frontend
npm run lint   # cek error eslint
npm run build  # build produksi
```

---

## 14. Ringkasan Hasil

- UI/UX di-redesign total: dari tampilan Bootstrap standar menjadi platform **sporty, premium, modern (dark theme)**.
- Tidak ada perubahan backend/API/database — semua fitur lama **tetap berjalan**.
- Tidak ada dependency baru — grafik & ikon dibuat mandiri.
- Mengutamakan **komponen reusable**, **konsistensi**, **responsif**, dan **aksesibilitas**.
- Data tetap 100% dari API Laravel; React hanya merender.

---

*Dokumentasi ini menyertai proyek SportHub — Laravel 11 REST API + React (Vite) + MySQL + Laravel Sanctum.*