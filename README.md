# Leaflet Agent Traffic

Project ini adalah simulasi traffic sederhana: agent (mobil) bergerak otomatis mengikuti jaringan jalan yang diambil dari data GeoJSON (OpenStreetMap / HOT export). Library ini menampilkan jalan di peta Leaflet, membuat agent yang spawn di segmen jalan, lalu menggerakkannya berdasarkan rute yang ditentukan saat spawn.

Dokumentasi konsep & alur kerja: [docs.md](docs.md).

## Instalasi

Install dari NPM:

```bash
npm install leaflet-agent-traffic
```
Pastikan `leaflet` sudah terpasang dan versinya memenuhi peer dependency (lihat [`package.json`](package.json).).

## Inisialisasi
### 1) Init instance (new AgentTraffic)

```js
import AgentTraffic from 'leaflet-agent-traffic';

const urlGeoJSON = 'https://pub-425058631f8a4bf298715f06780fe7d2.r2.dev/Roads_in_Jakarta_Timur.geojson';
const trafficSimulator = new AgentTraffic(map, urlGeoJSON);
```

**Penjelasan parameter:**
- `map`: instance Leaflet map (mis. hasil `L.map(...)`).
- `urlGeoJSON`: URL GeoJSON jalan yang akan di-fetch saat memanggil API `generateRoads`. URL harus mengembalikan GeoJSON `FeatureCollection` berisi jalan (`LineString`/`MultiLineString`) dan `properties.highway`.

### 2) API `generateRoads(bounds)`
Method ini digunakan untuk mengambil dan menampilkan jalan sesuai area yang kita tentukan.
Saat dipanggil, fungsi ini akan:
- Menghapus semua agent yang sebelumnya sudah dibuat.
- Mengambil data jalan berdasarkan bounding box (area peta yang dipilih).
- Menampilkan jaringan jalan tersebut sebagai layer polylines di peta Leaflet.
```js
await trafficSimulator.generateRoads(bounds);
```

**Parameter `bounds` (mandatory):**
- Tipe yang diterima:
	- Leaflet `LatLngBounds` (contoh: `map.getBounds()` atau `L.latLngBounds(sw, ne)`).
	- Objek dengan properti `_southWest` dan `_northEast` yang masing-masing `{lat, lng}`.
- ~~Jika `bounds` tidak diberikan, `roadManager.render` akan memakai `map.getBounds()` sebagai area render.~~

**Contoh:**

```js
const bounds = L.latLngBounds([ -6.25, 106.75 ], [ -6.15, 106.9 ]);
await trafficSimulator.generateRoads(bounds);
```

### 3) API `generateAgents(amount, options)`
Method ini dipakai untuk membuat sejumlah agent (kendaraan) baru di peta sesuai jumlah yang kamu tentukan. Agent-agent ini akan muncul di jalan yang sudah dirender dan siap bergerak otomatis.
```js
await trafficSimulator.generateAgents(amount, options);
```

**Parameter:**
- `amount`: jumlah agent (integer > 0).
- `options` (opsional): konfigurasi agent.
	- `color` (string): warna `divIcon` agent (mis. `"red"`, `"#00ff00"`).
	- `icon` (string): URL gambar untuk marker icon (PNG/SVG). Jika diisi, marker menggunakan image icon.

**Contoh:**

```js
await trafficSimulator.generateAgents(20, { color: '#ff5722' });
// or
await trafficSimulator.generateAgents(5, { icon: '/assets/car.png' });
```
## Demo Online

- Demo interaktif tersedia di: https://agenttraffic.pages.dev
- Demo ini memuat `example.geojson` dan menunjukkan simulasi agent tanpa perlu setup lokal. Gunakan untuk verifikasi cepat atau untuk melihat perilaku agent sebelum integrasi.

## API penting dan penjelasan parameter

| API | Parameter | Ringkas |
| --- | --- | --- |
| `generateRoads(bounds)` | `bounds` | Render jalan dari GeoJSON ke map. `bounds` bisa `LatLngBounds` atau objek `{ _southWest, _northEast }`. Jika kosong, pakai `map.getBounds()`. |
| `generateAgents(amount, options)` | `amount`, `options` (opsional) | Spawn agent random di segmen jalan. `amount` > 0. `options`: `color` (warna), `icon` (URL gambar). |
| `play()` | - | Mulai simulasi (loop animasi ~60 FPS). |
| `pause()` | - | Pause simulasi (state tetap). |
| `clear()` | - | Hentikan animasi dan hapus semua  & agents. |

## Sumber data
- Data jalan diambil dari OpenStreetMap (OSM). Cara yang direkomendasikan: gunakan exporter HOT (Humanitarian OpenStreetMap Team) pada https://export.hotosm.org/v3/ untuk mengekspor area yang diinginkan sebagai GeoJSON.
- File contoh untuk area Jakarta Timur tersedia di repository sebagai
[`sample.geojson`](sample.geojson).

## Format GeoJSON yang dibutuhkan
- Library mengharapkan GeoJSON FeatureCollection yang berisi feature bertipe `LineString` atau `MultiLineString` mewakili jalan.
- Hanya fitur dengan property `highway` tertentu yang akan diproses (lihat tabel tag di atas). Contoh feature minimal:

```json
{
	"type": "Feature",
	"properties": { "highway": "primary" },
	"geometry": { "type": "LineString", "coordinates": [[106.8, -6.2], [106.81, -6.199]] }
}
```

### Struktur data (contoh & catatan dari `example.geojson`)
- File harus berupa `FeatureCollection`:

```json
{
	"type": "FeatureCollection",
	"features": [ /* array of Feature */ ]
}
```

- Setiap `Feature` jalan biasanya memiliki:
	- `geometry.type`: `LineString` atau `MultiLineString`.
	- `geometry.coordinates`: array koordinat dalam format `[lng, lat]` (urutannya penting — GeoJSON selalu `lng, lat`).
	- `properties.highway`: tag OSM seperti `primary`, `trunk`, `motorway`, dll — library memfilter fitur berdasarkan `ALLOWED_HIGHWAYS`.
	- Optional `properties` lain yang sering hadir: `name`, `oneway`, `maxspeed`, `lanes`, `width`, `surface`, `id`.

- Contoh fitur (lebih lengkap):

```json
{
	"type": "Feature",
	"properties": {
		"highway": "primary",
		"name": "Jalan Contoh",
		"oneway": "no",
		"maxspeed": "50"
	},
	"geometry": {
		"type": "LineString",
		"coordinates": [[106.8, -6.2], [106.805, -6.1995], [106.81, -6.199]]
	}
}
```

- Perhatikan: library saat ini memecah `LineString` dengan beberapa vertex menjadi segmen-segmen dua-titik (edge). Panjang edge dihitung dengan rumus haversine (meter), dan agent di-spawn pada sebuah edge lalu menginterpolasi posisi linier di antara dua titik endpoint edge.

### Cara mendapatkan data dari HOT (Hot OSM Exporter)
1. Buka: https://export.hotosm.org/v3/exports/new/describe
2. Isi `Name`, `Description`, dan pilih `Project` (atau buat project baru jika perlu).
3. Pada bagian `Format`, pilih **GeoJSON (.geojson)**.
4. Pada bagian `Data` pilih kategori yang diinginkan — untuk jalan pilih **Transportation->Road**.
5. Tentukan area (bounding box) atau upload polygon area, lalu lanjutkan proses ekspor sampai selesai.
6. Setelah ekspor selesai, download file `.geojson` atau ambil URL publik bila tersedia. gunakan URL tersebut sebagai `roadsDataUrl` saat membuat `AgentTraffic`.

Jika Anda sudah punya contoh `example.geojson` (seperti `example.geojson` di repo), Anda bisa langsung menggunakan file itu untuk pengujian lokal.

---

| highway tag     | Artinya                                            | Masuk kriteria            |
| --------------- | -------------------------------------------------- | ------------------------- |
| `motorway`      | **Jalan tol**                                      | ✅ YA      |
| `motorway_link` | Ramp tol                                           | ✅ YA                      |
| `trunk`         | **Jalan nasional utama** (setara tol tapi non-tol) | ✅ YA                      |
| `trunk_link`    | Akses ke trunk                                     | ✅ YA                      |
| `primary`       | **Jalan raya utama kota / antar kota**             | ✅ YA |
| `primary_link`  | Akses ke primary                                   | ✅ YA                      |
| `secondary`     | Jalan besar sekunder                               | ⚠️ BISA (opsional)         |
| `tertiary`      | Jalan penghubung                                   | ❌ TIDAK                   |
| `residential`   | Jalan perumahan                                    | ❌ TIDAK                   |
| `service`       | Jalan servis                                       | ❌ TIDAK                   |
| `living_street` | Jalan lingkungan                                   | ❌ TIDAK                   |

## MVP
- [x] Agents / Kendaraan / Objects: hanya **mobil**
- [x] Generate roads berdasarkan **bounding box (bbox)**
- [x] Generate agents & routes secara **random** di jalan
- [x] States: **Play**, **Pause**, **Clear**

---

## Next
### Traffic Logic
- [ ] **One-way streets** logic
- [ ] **Traffic lights** / lampu lalu lintas

### Vehicles
- [ ] Tambahkan **motor** sebagai agent/kendaraan
- [ ] **Collision detection** & **auto speeding**

### Advanced Movement
- [ ] **Pindah jalur** (mobil/motor) (multi jalur)
- [ ] Mengukur **lebar jalan** untuk pindah jalur