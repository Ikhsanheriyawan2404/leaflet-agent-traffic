import L from "leaflet";
import GridIndex from "./spatial.index.js";
import {
  featureInBounds,
  fetchRoadsData,
  getBoundsFromInput,
} from "../utils/geo.js";
import { buildRoadGraph } from "../utils/road-graph.js";
import { ALLOWED_HIGHWAYS } from "../utils/constant.js";

export default class RoadManager {
  constructor(map, roadsDataUrl) {
    this.map = map;
    this.roadsDataUrl = roadsDataUrl;
    this.layerGroup = L.layerGroup();
    this._data = null;
    this.roadGraph = null;
    this.roadIndex = new GridIndex();
  }

  async load() {
    if (this._data) return this._data;
    this._data = await fetchRoadsData(this.roadsDataUrl);
    return this._data;
  }

  async render(bounds) {
    const data = await this.load();
    const finalBounds = getBoundsFromInput(bounds)
    const isAllowedHighway = (highway) => {
      if (!highway) return false;
      if (Array.isArray(highway)) {
        return highway.some((h) => ALLOWED_HIGHWAYS.has(h));
      }
      return ALLOWED_HIGHWAYS.has(highway);
    };

    const filtered = {
      type: "FeatureCollection",
      features: (data.features || []).filter((f) =>
        isAllowedHighway(f.properties?.highway) && featureInBounds(f, finalBounds)
      ),
    };
    
    this.roadGraph = buildRoadGraph(filtered, this.roadIndex);

    this.layerGroup.clearLayers();
    const layer = L.geoJSON(filtered, {
      style: (feature) => {
        let color = "rgba(0, 255, 255, 0.7)";
        const { highway } = feature.properties || {};
        const highways = [...ALLOWED_HIGHWAYS]
        if (highway.includes(highways[0]) || highway.includes(highways[1])) {
          // jalan tol
          color = "rgba(255, 0, 0, 0.7)";
        }

        const widthVal = feature.properties && feature.properties.width
          ? Number(feature.properties.width)
          : 1;

        const weight = Math.max(1, Math.min(10, widthVal));

        return {
          color,
          weight,
          opacity: 0.8,
        };
      },
    });
    this.layerGroup.addLayer(layer);

    if (!this.map.hasLayer(this.layerGroup)) {
      this.layerGroup.addTo(this.map);
    }

    return layer;
  }

  clear() {
    this.roadGraph = null;
    this.roadIndex.clear();
    this.layerGroup.clearLayers();
  }

  getRoadGraph() {
    return this.roadGraph;
  }

  getRoadIndex() {
    return this.roadIndex;
  }
}
