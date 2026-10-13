# 🎮 Petualangan Bilangan 1-10 — Game Matematika SDLB

Game pembelajaran matematika berbasis web untuk **Kelas I SDLB Fase A** (Hambatan Intelektual), dikembangkan berdasarkan RPM Matematika / Elemen Bilangan (Kurikulum Merdeka — Pembelajaran Mendalam).

## 🌐 Live Demo

| URL | Status |
|-----|--------|
| https://petualangan-bilangan-sdlb.vercel.app | ✅ Aktif |
| https://guruslbifh.my.id | ⏳ Perlu konfigurasi DNS |

## 🎯 Permainan

| Game | TP | Deskripsi |
|------|-----|-----------|
| 🧺 Seret & Hitung | TP1 | Seret benda konkret ke keranjang sesuai angka |
| 🔢 Cocokkan Jumlah | TP2 | Hubungkan kelompok benda dengan angka |
| 🚂 Kereta Angka | TP3 | Urutkan angka 1-10 di gerbong kereta |
| ➕ Gabung & Hitung | TP5 | Penjumlahan dua kelompok (hasil ≤ 5) |
| ✏️ Jejak Angka | TP4 | Telusuri bentuk angka 1-10 di kanvas |

## 🖼️ Aset Gambar

Menggunakan **Twemoji SVG** (MIT License, CC-BY 4.0) untuk gambar benda konkret yang konsisten di semua platform:

🍎 🍊 🎈 ⭐ 🐟 🍪 🌸 🚗 🧱 🍓 🦋 🍌 🍇 🍒 🐞 🎀

## 📁 Struktur File

```
game-matematika/
├── index.html
├── vercel.json
├── css/style.css
├── js/
│   ├── twemoji.min.js
│   ├── audio.js
│   ├── dragdrop.js
│   ├── games.js
│   └── app.js
└── README.md
```

## 🚀 Deployment

- **Vercel Project**: petualangan-bilangan-sdlb
- **GitHub Repo**: insanfahmi94/petualangan-bilangan-sdlb

## 🔧 DNS Configuration untuk guruslbifh.my.id

Tambahkan record berikut di dashboard DNS domain Anda:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |
