# Qur'an Play: Juz 30

Game edukasi menghafal Al-Qur'an khusus **Juz 30 (Juz 'Amma)** berbasis mobile-first (PWA-ready) menggunakan **React**, **Vite**, dan **Tailwind CSS**.

## Fitur Utama
- **37 Surat Juz 30** (An-Naba s.d. An-Nas) diambil dinamis dari **Quran.com API v4** (`words=true&translations=33&word_fields=text_uthmani`) dengan cache `localStorage` dan data fallback offline (An-Naba 1–10, Al-Ikhlas, An-Nas).
- **2 Mode Permainan:**
  - **Mode Susun Ayat (Mushaf):** Halaman mushaf bergaris tipis, banner hijau nama surat, Basmalah, nomor ayat Arab-Indic, target kuning, dan toggle **Ghost Text**.
  - **Mode Susun Terjemahan:** Ayat Arab utuh di atas dan susunan kata terjemahan Kemenag RI di bawah.
- **Kustomisasi Avatar Bot:** 8 warna bot + 6 aksesoris topi SVG (Tanpa topi, Peci putih, Kopyah hitam, Topi kasual, Topi koboi, Bucket hat).
- **Web Audio API SFX:** Efek suara klik, benar, salah, combo, hint, stage selesai, menang, dan game over tanpa file audio eksternal.
- **Sistem Progres:** 5 nyawa, 3 hint per level, combo badge, skor & koin, perolehan 1–3 bintang, konfeti kemenangan, serta pagination/chunk per 10 ayat untuk surat panjang.

## Pengembangan & Build
```bash
npm install
npm run dev
npm run build
```
CI/CD tersedia melalui GitHub Actions di `.github/workflows/build.yml`.
