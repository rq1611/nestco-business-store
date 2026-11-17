# NÉST & CO. — Business Profile + E-Commerce Template

Template website bisnis responsif yang menggabungkan company profile dan toko online sederhana menggunakan **HTML, CSS, dan JavaScript murni** (tanpa Bootstrap atau framework).

## Fitur

- Company profile: hero, cerita/sejarah singkat, visi, misi, nilai perusahaan, journal, dan kontak.
- Katalog produk dari data JavaScript.
- Filter kategori, pencarian produk, dan pengurutan harga/nama.
- Detail produk dalam modal.
- Wishlist yang tersimpan di `localStorage`.
- Keranjang belanja: tambah produk, ubah kuantitas, hapus produk, subtotal, estimasi ongkir, dan gratis ongkir.
- Checkout demo dengan validasi form dan nomor pesanan contoh.
- Newsletter demo, toast notification, navigasi mobile, dan tombol kembali ke atas.
- Layout responsif untuk desktop, tablet, dan ponsel.

## Struktur folder

```text
nestco-business-store/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── img/
    └── (folder untuk gambar lokal milik bisnis)
```

## Cara menjalankan

1. Ekstrak folder proyek.
2. Buka folder `nestco-business-store` di VS Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server, atau buka langsung file `index.html` di browser.
4. Pastikan koneksi internet tersedia karena font dan gambar contoh menggunakan layanan eksternal.

## Bagian yang perlu disesuaikan

### 1. Identitas bisnis
Ubah nama `NÉST & CO.`, deskripsi, sejarah, visi-misi, alamat, email, dan tautan media sosial di `index.html`.

### 2. Data produk
Edit array `products` pada bagian awal `js/script.js`. Setiap produk menggunakan properti:

- `id`: ID unik produk.
- `name`: nama produk.
- `category`: `home`, `lifestyle`, atau `accessories`.
- `categoryLabel`: nama kategori yang tampil.
- `price` dan `oldPrice`: harga dalam Rupiah.
- `label`: label seperti Best Seller atau New Arrival.
- `image`: URL gambar produk.
- `description`: deskripsi produk.

### 3. Gambar
Saat ini gambar menggunakan URL Unsplash sebagai contoh. Ganti dengan foto produk/perusahaan sendiri. Simpan gambar lokal pada folder `img/`, lalu ubah URL `image` di `js/script.js` atau atribut `src` di `index.html` menjadi path lokal, misalnya `img/nama-produk.jpg`.

### 4. Pengaturan ongkir
Di bagian awal `js/script.js`, ubah nilai:

```js
const FREE_SHIPPING_THRESHOLD = 300000;
const DEFAULT_SHIPPING_FEE = 18000;
```

## Catatan penting tentang transaksi dan pembayaran

Fitur checkout pada template ini **hanya simulasi front-end**. Data pesanan ditampilkan di console browser dan tidak dikirim ke server. Tidak ada pembayaran otomatis yang benar-benar diproses.

Agar siap digunakan sebagai toko online sungguhan, perlu ditambahkan:

1. Backend/API untuk akun pelanggan, stok, pesanan, dan database.
2. Payment gateway (misalnya Midtrans atau Xendit) untuk membuat transaksi dan menerima status pembayaran melalui callback/webhook.
3. Integrasi kurir/ongkir serta validasi pesanan di sisi server.
4. Kebijakan privasi, syarat layanan, keamanan, dan pengelolaan data pelanggan.

Jangan menganggap pesanan demo sebagai transaksi yang sudah dibayar.
