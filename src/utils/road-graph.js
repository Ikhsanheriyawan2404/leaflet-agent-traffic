import { EARTH_RADIUS } from "./constant.js";

const toRad = (deg) => (deg * Math.PI) / 180;

const haversine = (a, b) => {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) *
      Math.cos(lat1Rad) *
      Math.cos(lat2Rad);
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
};

const bboxFromCoords = (coords) => {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [minLng, minLat, maxLng, maxLat];
};

const buildRoadGraph = (data, index) => {
  const nodes = [];
  const edges = [];
  const nodeIndex = new Map();
  const edgeIndex = new Map();

  const ensureNode = (lng, lat) => {
    const key = `${lng},${lat}`;
    let id = nodeIndex.get(key);
    if (id === undefined) {
      id = nodes.length;
      nodeIndex.set(key, id);
      nodes.push({ id, lat, lng, out: [], in: [] });
    }
    return id;
  };

  const addSegment = (a, b, props) => {
    const [lng1, lat1] = a;
    const [lng2, lat2] = b;
    const from = ensureNode(lng1, lat1);
    const to = ensureNode(lng2, lat2);
    const geom = [a, b];
    const length = haversine(a, b);
    const bbox = bboxFromCoords(geom);
    const id = edges.length;
    edges.push({ id, from, to, length, bbox, geom, properties: props || {} });
    edgeIndex.set(id, id);
    nodes[from].out.push(id);
    nodes[to].in.push(id);
    if (index) index.insertBBox(id, bbox);
  };

  const features = data?.features || [];
  for (const feature of features) {
    const { geometry, properties } = feature || {};
    if (!geometry || !geometry.coordinates) continue;
    if (geometry.type === "LineString") {
      const coords = geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i += 1) {
        addSegment(coords[i], coords[i + 1], properties);
      }
    } else if (geometry.type === "MultiLineString") {
      for (const line of geometry.coordinates) {
        for (let i = 0; i < line.length - 1; i += 1) {
          addSegment(line[i], line[i + 1], properties);
        }
      }
    }
  }

  return { nodes, edges, nodeIndex, edgeIndex };
};

export { toRad, haversine, bboxFromCoords, buildRoadGraph };