# Traffic Simulation Project Notes

| highway tag     | Artinya                                            | Masuk kriteria kamu?      |
| --------------- | -------------------------------------------------- | ------------------------- |
| `motorway`      | **Jalan tol**                                      | ✅ YA (WAJIB)              |
| `motorway_link` | Ramp tol                                           | ✅ YA                      |
| `trunk`         | **Jalan nasional utama** (setara tol tapi non-tol) | ✅ YA                      |
| `trunk_link`    | Akses ke trunk                                     | ✅ YA                      |
| `primary`       | **Jalan raya utama kota / antar kota**             | ✅ YA (INI YANG KAMU CARI) |
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
- [ ] **Pindah jalur** (mobil/motor)  
- [ ] Mengukur **lebar jalan** untuk pindah jalur