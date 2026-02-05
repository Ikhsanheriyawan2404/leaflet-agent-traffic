import L from "leaflet";

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function getBoundsFromInput(bounds) {
  const isValidLatLng = ({ lat, lng }) =>
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180;

  if (bounds) {
    if (typeof bounds === "object" && bounds._southWest && bounds._northEast) {
      if (isValidLatLng(bounds._southWest) && isValidLatLng(bounds._northEast)) {
        return L.latLngBounds(bounds._southWest, bounds._northEast);
      }
      throw new Error("Invalid bounds: lat/lng out of range.");
    }

    if (
      typeof bounds.getSouthWest === "function" &&
      typeof bounds.getNorthEast === "function"
    ) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      if (isValidLatLng(sw) && isValidLatLng(ne)) return bounds;
      throw new Error("Invalid bounds: lat/lng out of range.");
    }

    throw new Error("Invalid bounds: expected object with _southWest/_northEast.");
  }

  throw new Error("Invalid bounds: no bounds provided and map.getBounds missing.");
}

export function randomLatLngInBounds(bounds) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const lat = sw.lat + Math.random() * (ne.lat - sw.lat);
  const lng = sw.lng + Math.random() * (ne.lng - sw.lng);
  return [lat, lng];
}

export function featureInBounds(feature, bounds) {
  if (!bounds || typeof bounds.contains !== "function") return true;
  if (!feature || !feature.geometry) return true;
  const { type, coordinates } = feature.geometry;
  if (!coordinates) return false;

  const inBounds = (lat, lng) => bounds.contains([lat, lng]);

  if (type === "LineString") {
    return coordinates.some(([lng, lat]) => inBounds(lat, lng));
  }

  if (type === "MultiLineString") {
    return coordinates.some((line) =>
      line.some(([lng, lat]) => inBounds(lat, lng))
    );
  }

  if (type === "Point") {
    const [lng, lat] = coordinates;
    return inBounds(lat, lng);
  }

  if (type === "MultiPoint") {
    return coordinates.some(([lng, lat]) => inBounds(lat, lng));
  }

  if (type === "Polygon") {
    return coordinates.some((ring) =>
      ring.some(([lng, lat]) => inBounds(lat, lng))
    );
  }

  if (type === "MultiPolygon") {
    return coordinates.some((poly) =>
      poly.some((ring) => ring.some(([lng, lat]) => inBounds(lat, lng)))
    );
  }

  return false;
}

export async function fetchRoadsData(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch roads data: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Response is not valid JSON");
  }
}