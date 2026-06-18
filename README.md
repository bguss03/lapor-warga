# Lapor Warga Mobile 📱

Aplikasi pelaporan warga berbasis web (Mobile-first PWA) yang memudahkan masyarakat untuk melaporkan kejadian, infrastruktur rusak, keluhan, atau aspirasi secara langsung dan real-time.

---

## ✨ Fitur Utama

- **Autentikasi Terpusat:** Login dan registrasi yang aman menggunakan Supabase.
- **Buat Laporan dengan Lokasi:** Formulir pelaporan intuitif, mendukung unggah media dan penandaan titik lokasi dengan peta interaktif (Leaflet).
- **Lacak Riwayat Laporan:** Pantau status dan tindak lanjut laporan yang telah dibuat pada menu riwayat.
- **Notifikasi Real-time:** Dapatkan pembaruan instan setiap kali ada perubahan status pada laporan Anda.
- **Dashboard Ringkasan:** Visualisasi data statistik mengenai laporan yang ada di lingkungan sekitar.
- **Manajemen Profil:** Pengaturan profil pengguna yang mudah dan personal.

---

## 🚀 Teknologi yang Digunakan

Proyek ini dibangun di atas *stack* modern untuk memastikan performa yang cepat, aman, dan mudah di-maintain:

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Routing & SSR:** [TanStack Start](https://tanstack.com/start/latest) & [TanStack Router](https://tanstack.com/router/latest)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) (dibangun di atas [Radix UI](https://www.radix-ui.com/))
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Maps:** [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
- **Icons & Visuals:** [Lucide React](https://lucide.dev/), [Recharts](https://recharts.org/)

### Backend & Layanan
- **BaaS (Backend as a Service):** [Supabase](https://supabase.com/) (Database, Auth, dan Storage)

---

## 📁 Struktur Proyek

```text
src/
├── components/   # Komponen antarmuka yang dapat digunakan kembali (termasuk komponen dari Shadcn UI)
├── hooks/        # Kumpulan Custom React Hooks untuk logika bisnis
├── lib/          # Utilitas, konfigurasi client Supabase, dan helper functions
├── routes/       # File-based routing menggunakan TanStack Router
│   ├── auth/             # Halaman masuk & pendaftaran
│   ├── _app/             # Layout dasar utama setelah login
│   │   ├── home/         # Beranda (Dashboard)
│   │   ├── report/       # Halaman pembuatan laporan baru
│   │   ├── my-reports/   # Daftar riwayat laporan pengguna
│   │   ├── notifications/# Pusat notifikasi
│   │   └── profile/      # Pengaturan profil pengguna
│   └── welcome/          # Layar onboarding bagi pengguna baru
├── server.ts     # Konfigurasi entry-point server (untuk keperluan SSR)
├── start.ts      # Setup instance TanStack Start
└── styles.css    # File CSS utama global
```

---

## 🛠️ Panduan Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin pengembangan Anda:

### Prasyarat
- **Node.js** (Versi 18 LTS atau lebih baru)
- **npm** (Versi 9+) atau package manager lain yang kompatibel
- Proyek **Supabase** yang sudah disiapkan untuk mengelola database dan autentikasi.

### Langkah-langkah

1. **Clone Repositori**
   ```bash
   git clone <url-repositori-anda>
   cd lapor-warga-mobile
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di direktori *root* (sejajar dengan `package.json`). Isi dengan kredensial dari dashboard Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://<project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<kunci-anon-supabase-anda>
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Server pengembangan akan berjalan. Anda bisa mengakses aplikasi melalui browser (biasanya di `http://localhost:5173`).

---

## 📦 Daftar Script Tersedia

- `npm run dev` — Menjalankan server lokal dalam mode *development* (termasuk Hot Module Replacement).
- `npm run build` — Melakukan *build* aplikasi dengan optimalisasi ke tahap *production*.
- `npm run preview` — Melihat *preview* secara lokal dari hasil `build` untuk memastikan aplikasi berjalan baik sebelum *deploy*.
- `npm run lint` — Menjalankan *ESLint* untuk memeriksa *code convention* dan masalah umum.
- `npm run format` — Memperbaiki format penulisan kode secara otomatis menggunakan *Prettier*.

---

## 🤝 Berkontribusi

Kami menyambut segala bentuk kontribusi yang positif! Jika Anda ingin menambahkan fitur, melaporkan *bug*, atau melakukan optimasi:
1. Lakukan *Fork* pada repositori ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturKerenAnda`).
3. Lakukan *commit* perubahan (`git commit -m 'Menambahkan FiturKerenAnda'`).
4. Lakukan *push* ke *branch* tersebut (`git push origin feature/FiturKerenAnda`).
5. Buka **Pull Request**.

