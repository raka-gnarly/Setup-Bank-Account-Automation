# Setup Bank Account Automation

## Pendahuluan
Proyek ini bertujuan untuk mengatur dan menjelaskan langkah-langkah dalam mendirikan sistem perbankan sederhana.

## Persyaratan
- Node.js
- NPM
- MySQL

## Langkah-langkah Setup

1. **Clone Repository**
    ```bash
    git clone https://github.com/raka-gnarly/Setup-Bank-Account-Automation.git
    cd Setup-Bank-Account-Automation
    ```

2. **Instalasi Dependensi**
    ```bash
    npm install
    ```

3. **Konfigurasi Database**
    - Buat database baru di MySQL.
    - Gunakan referensi `.env.example` untuk menyesuaikan file `.env` dengan konfigurasi database Anda.

4. **Menjalankan Aplikasi**
    Aplikasi ini memiliki service utama dan child service.
    ### Service utama
    - Service utama berfungsi untuk layanan bot setup bank automation.
    - Gunakan command berikut untuk menjalankan service utama
    ```bash
    node index.js
    ```
    ### Child service
    - **Group Generator**
        - Berfungsi jika hanya ingin menjalankan layanan bot create group automation
        - Gunakan command berikut untuk menjalankan service group generator
        ```bash
        node service/group
        ```

## Struktur Proyek
- `src/` - Kode utama aplikasi
- `group/` - Kode utama automation create group
- `db/` - Kode utama untuk action insert data bank ke database
- `data/` - Berisi config JSON untuk menerima message pada setiap grup yang ditempati oleh bot
- `config/` - Kode utama untuk mengambil data dari .env
- `test/` - Berisi kode untuk melakukan testing function secara terpisah 

## Kontribusi
Silakan buat pull request untuk kontribusi atau perbaikan.

## Credit
Develop and Initiated by cemilick
© 2025 Setup Bank Account Automation. All rights reserved.