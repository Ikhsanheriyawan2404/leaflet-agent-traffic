export default class GridIndex {
  constructor(cellSize = 0.002) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.itemCells = new Map();
  }

  _cellXY(lat, lng) {
    return [
      Math.floor(lng / this.cellSize),
      Math.floor(lat / this.cellSize),
    ];
  }

  _key(x, y) {
    return `${x}:${y}`;
  }

  _addToCell(key, id) {
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = new Set();
      this.cells.set(key, bucket);
    }
    bucket.add(id);
  }

  _removeFromCell(key, id) {
    const bucket = this.cells.get(key);
    if (!bucket) return;
    bucket.delete(id);
    if (bucket.size === 0) this.cells.delete(key);
  }

  insertPoint(id, lat, lng) {
    const [x, y] = this._cellXY(lat, lng);
    const key = this._key(x, y);
    this._addToCell(key, id);
    this.itemCells.set(id, new Set([key]));
  }

  updatePoint(id, lat, lng) {
    const [x, y] = this._cellXY(lat, lng);
    const key = this._key(x, y);
    const prev = this.itemCells.get(id);
    if (prev && prev.size === 1 && prev.has(key)) return;
    if (prev) {
      for (const k of prev) this._removeFromCell(k, id);
    }
    this._addToCell(key, id);
    this.itemCells.set(id, new Set([key]));
  }

  insertBBox(id, bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const [x0, y0] = this._cellXY(minLat, minLng);
    const [x1, y1] = this._cellXY(maxLat, maxLng);
    const keys = new Set();
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x += 1) {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y += 1) {
        const key = this._key(x, y);
        this._addToCell(key, id);
        keys.add(key);
      }
    }
    this.itemCells.set(id, keys);
  }

  queryBBox(bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox;
    const [x0, y0] = this._cellXY(minLat, minLng);
    const [x1, y1] = this._cellXY(maxLat, maxLng);
    const result = new Set();
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x += 1) {
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y += 1) {
        const key = this._key(x, y);
        const bucket = this.cells.get(key);
        if (!bucket) continue;
        for (const id of bucket) result.add(id);
      }
    }
    return Array.from(result);
  }

  remove(id) {
    const keys = this.itemCells.get(id);
    if (!keys) return;
    for (const k of keys) this._removeFromCell(k, id);
    this.itemCells.delete(id);
  }
}