## Roadmap Konsep & Teknis

### 1️⃣ Memuat Data Jalan

**(Ambil Data Sekali, Simpan untuk Dipakai Lagi)**

* `RoadManager.load()` ibarat “mengunduh peta jalan”.
* Setelah peta didapat, peta itu disimpan di memori (`_data`) supaya tidak perlu unduh ulang.
* Dampaknya: lebih cepat dan hemat biaya data.

---

### 2️⃣ Menentukan Area Render & Filter Atribut Jalan

**(Pilih Area yang Ditampilkan + Pilih Jenis Jalan)**

* `render(bounds)` menentukan “kotak area peta” yang sedang dipilih pengguna.
* Lalu data jalan disaring dengan dua aturan:
  * hanya jalan yang berada di dalam area peta
  * hanya jenis jalan yang dianggap penting (misal jalan besar, tol)
* Catatan: saat ini penyaringan hanya memakai jenis `highway`, belum mempertimbangkan arah `oneway`.

---

### 3️⃣ Membangun Road Graph + Spatial Index

**(Menyusun Jaringan Jalan + Daftar Pencarian Cepat)**

* Data jalan yang sudah disaring disusun menjadi “jaringan”:
  * **Node** = titik simpul (misalnya pertemuan/ujung jalan)
  * **Edge** = potongan jalan yang menghubungkan dua titik
* Setiap potongan jalan dicatat informasinya:
  * panjang (jarak nyata)
  * kotak pembatas (batas koordinatnya)
  * dua titik ujungnya
  * atribut jalan (misal lebar, jenis)
* Semua potongan jalan juga dimasukkan ke “daftar pencarian cepat” (grid index)
  agar nanti bisa mencari jalan terdekat tanpa harus memeriksa semua jalan satu per satu.

---

### 4️⃣ Rendering Layer Jalan di Leaflet

**(Menggambar Jalan di Peta)**

* Jalan yang sudah dipilih digambar di peta sebagai layer.
* Warna jalan dibedakan agar mudah terlihat:
  * merah untuk jalan tol
  * biru muda untuk jalan lainnya
* Tebal garis mengikuti data lebar jalan jika tersedia.

---

### 5️⃣ Manajemen Data Jalan

**(Mengambil Data dan Membersihkan)**

* `getRoadGraph()` dan `getRoadIndex()` dipakai jika bagian lain aplikasi butuh
  “jaringan jalan” atau daftar pencarian cepat.
* `clear()` dipakai saat ingin memulai ulang: semua data jalan dan gambar di peta dibersihkan.

---

## Bagian Agent Manager

### A) Plot/Spawn Agent Secara Random tapi Tetap di Jalan

* Sistem memilih **segmen jalan (edge)** secara acak dari hasil road graph.
* Lalu agent ditempatkan di **posisi acak di sepanjang segmen itu**.
  Ibaratnya: kita pilih satu ruas jalan, lalu mobil “muncul” di titik mana saja
  di ruas tersebut, bukan di luar jalan.

### B) Menentukan Rute untuk Tiap Agent (Walk‑Random)

* Setelah agent punya segmen awal, sistem menyusun rute sederhana:
  * di ujung segmen, agent memilih **segmen berikutnya** yang terhubung
  * proses ini diulang beberapa langkah (maksimum tertentu)
* Hasilnya adalah daftar segmen yang akan dilalui agent secara **acak tapi tetap nyambung**.

### C) Smart Moving (Mekanisme Gerak)

* Pergerakan dihitung **berdasarkan waktu** dan **kecepatan** agent.
* Agent bergerak di segmen aktif, lalu pindah ke segmen berikutnya jika sudah sampai ujung.
* Posisi dihitung dari “progres” di segmen (0–100%).
* Arah (heading) disesuaikan dengan arah segmen agar ikon mobil menghadap benar.

Catatan tambahan:
* Mekanisme ini masih **satu jalur**, belum ada pindah lajur.
* Jika ada aturan tambahan (misal traffic light atau oneway), nanti logikanya masuk di bagian ini.

---