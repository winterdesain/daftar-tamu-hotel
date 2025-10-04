# CRM Laravel Scaffold (Generated)

Ini adalah scaffold project Laravel yang dibuat dari file frontend kamu.

**Catatan penting:** vendor dan dependensi Laravel **tidak** termasuk. Untuk menjalankan project ini, ikuti instruksi di bawah.

## Cara menjalankan (di mesin dengan PHP & Composer)

1. Ekstrak zip project ini.
2. Masuk ke folder project:
   ```bash
   cd crm_laravel_project
   ```
3. Install dependensi composer:
   ```bash
   composer install
   ```
4. Salin file environment dan generate app key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
5. Buat database MySQL dan sesuaikan kredensial di `.env`.
6. Jalankan migrasi:
   ```bash
   php artisan migrate
   ```
7. (Opsional) Buat user manual di tabel `users` (gunakan password hashed). Contoh:
   ```sql
   INSERT INTO users (name,email,password,created_at,updated_at) VALUES ('Admin','admin@example.com','$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', NOW(), NOW());
   ```
   _Catatan_: contoh hash di atas adalah bcrypt; kamu bisa gunakan `php artisan tinker` atau fungsi `bcrypt()`.
8. Jalankan server lokal:
   ```bash
   php artisan serve
   ```

Jika kamu mau, saya bisa bantu langkah demi langkah untuk menjalankan `composer install` dan migrasi (tapi itu harus kamu jalankan di mesin lokal/server).

