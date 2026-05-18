# shamela-mcp

Panduan ini ditulis untuk **pengguna awam**, terutama pengguna **Maktabah al-Shamela / المكتبة الشاملة** yang ingin memakai koleksi lokalnya lewat aplikasi AI yang mendukung MCP.

## Apa ini?

`shamela-mcp` adalah server MCP lokal yang menghubungkan aplikasi AI Anda ke instalasi **Shamela 4** di komputer Anda.

Dengan ini, aplikasi AI bisa:

- mencari isi buku-buku Shamela yang sudah Anda unduh
- mencari penulis, judul kitab, dan ayat Al-Qur'an
- membuka halaman kitab
- membaca daftar isi dan bagian kitab
- membuat kutipan/sitasi dari halaman kitab

Semua proses baca dilakukan **lokal di komputer Anda**. Server ini tidak menulis ke database Shamela.

## Cocok untuk siapa?

Cocok untuk Anda jika:

- Anda sudah memakai Shamela 4
- Anda punya kitab yang sudah diunduh di Shamela
- Anda ingin bertanya ke aplikasi AI dengan sumber langsung dari pustaka Shamela Anda

## Yang Anda butuhkan

- Shamela 4 terpasang di komputer
- Minimal satu kitab sudah diunduh di Shamela
- Aplikasi AI yang mendukung **MCP local/stdio**
- Node.js 20 atau lebih baru

## Cara pakai untuk pengguna awam

### 1. Unduh release

Unduh file release terbaru dari GitHub repo ini.

Pilih salah satu:

- `shamela-mcp-<version>.zip`
- `shamela-mcp-<version>.tgz`

Kalau Anda pengguna Windows biasa, pilih file `.zip`.

### 2. Ekstrak file

Ekstrak file release ke folder yang mudah ditemukan.

Contoh:

- `C:\tools\shamela-mcp`
- `/Users/namaanda/tools/shamela-mcp`

Setelah diekstrak, di dalam folder itu harus ada:

- `dist/index.js`
- `helper/shamela-helper.jar`
- `examples/`
- `docs/`

### 3. Siapkan konfigurasi MCP di aplikasi Anda

Gunakan konfigurasi minimal seperti ini:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/shamela-mcp/dist/index.js"]
    }
  }
}
```

Ganti path `/ABSOLUTE/PATH/TO/shamela-mcp/dist/index.js` dengan path asli di komputer Anda.

Contoh di Windows:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["C:\\tools\\shamela-mcp\\dist\\index.js"]
    }
  }
}
```

Contoh siap pakai ada di [../examples/universal-mcp.json](../examples/universal-mcp.json).

### 4. Restart aplikasi AI Anda

Setelah config MCP disimpan, tutup penuh aplikasi AI Anda lalu buka lagi.

### 5. Coba pertanyaan pertama

Coba pertanyaan sederhana seperti:

- `Cari kata "الكلام" di pustaka Shamela saya`
- `Tampilkan halaman dari kitab yang membahas تعريف الكلام`
- `Cari semua kitab karya ابن عثيمين yang ada di Shamela saya`

Kalau konfigurasi benar, aplikasi AI akan mulai memakai tool `shamela_*`.

## Apakah harus isi path Shamela dan Java manual?

Biasanya **tidak perlu**.

Server akan mencoba mencari otomatis:

- lokasi instalasi Shamela
- Java bawaan yang ada di dalam instalasi Shamela

Kalau autodetect gagal, baru pakai konfigurasi dengan `env`.

Contohnya ada di [../examples/universal-mcp-with-env.json](../examples/universal-mcp-with-env.json).

## Kalau autodetect gagal

Gunakan config seperti ini:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["C:\\tools\\shamela-mcp\\dist\\index.js"],
      "env": {
        "SHAMELA_INSTALL_ROOT": "C:\\path\\ke\\Shamela",
        "SHAMELA_JRE": "C:\\path\\ke\\java.exe"
      }
    }
  }
}
```

`SHAMELA_INSTALL_ROOT` adalah folder utama Shamela yang berisi:

- `database`
- `app`

## Contoh penggunaan nyata

Anda bisa bertanya seperti ini:

- `Cari pembahasan الاستصناع di kitab fikih yang sudah saya unduh`
- `Buka halaman kitab yang menjelaskan معنى القياس`
- `Carikan tafsir untuk ayat الكرسي dari kitab tafsir yang ada di Shamela saya`
- `Buatkan kutipan dari halaman ini`

## Masalah umum

### Tool tidak muncul di aplikasi AI

Biasanya karena:

- config MCP belum benar
- path `dist/index.js` salah
- aplikasi belum direstart penuh

### Shamela tidak ditemukan

Biasanya karena lokasi Shamela tidak ada di jalur umum.

Solusi:

- isi `SHAMELA_INSTALL_ROOT` manual

### Java tidak ditemukan

Biasanya karena Java bawaan Shamela tidak terdeteksi.

Solusi:

- isi `SHAMELA_JRE` manual

### Tidak ada hasil pencarian

Periksa:

- apakah kitabnya memang sudah diunduh di Shamela
- apakah kata kuncinya benar
- apakah Anda membatasi pencarian terlalu sempit

## Untuk pengguna teknis

Kalau Anda ingin build dari source:

```bash
npm install
npm run build
node dist/index.js
```

Tapi untuk pengguna awam, **pakai release GitHub saja**. Itu lebih ringan dan lebih aman daripada build sendiri.
