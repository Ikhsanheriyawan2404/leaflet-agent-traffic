import L from "leaflet";
import GridIndex from "./spatial.index.js";
import { createAgentIcon } from "../utils/icon.js";

export default class AgentManager {
  constructor(map, roadManager) {
    this.map = map;
    this.roadManager = roadManager;
    this.layerGroup = L.layerGroup();
    this.agents = [];
    this.agentIndex = new GridIndex();
    this._nextId = 1;
  }

  _pickNextEdge(roadGraph, edgeId) {
    const edge = roadGraph.edges[edgeId];
    if (!edge) return null;
    const node = roadGraph.nodes[edge.to];
    if (!node || !node.out || node.out.length === 0) return null;
    return node.out[Math.floor(Math.random() * node.out.length)];
  }

  _buildRoute(roadGraph, startEdgeId, maxSteps = 12) {
    const route = [];
    let currentEdgeId = startEdgeId;
    for (let i = 0; i < maxSteps; i += 1) {
      if (currentEdgeId === null || currentEdgeId === undefined) break;
      route.push(currentEdgeId);
      currentEdgeId = this._pickNextEdge(roadGraph, currentEdgeId);
    }
    return route;
  }

  async createAgents(amount, options = { color: "blue" }) {
    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    if (!this.roadManager) {
      throw new Error("RoadManager dependency is required.");
    }

    await this.roadManager.load();
    const roadGraph = this.roadManager.getRoadGraph();
    const edges = roadGraph?.edges || [];
    const { color, routeLength = 12, speed = 12 } = options;
    
    if (edges.length === 0) {
      throw new Error("No road segments available to spawn agents.");
    }

    for (let i = 0; i < amount; i += 1) {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const [[lng1, lat1], [lng2, lat2]] = edge.geom;
      const t = Math.random();
      const lat = lat1 + (lat2 - lat1) * t;
      const lng = lng1 + (lng2 - lng1) * t;
      const id = this._nextId;
      this._nextId += 1;

      const marker = L.marker([lat, lng], {
        icon: createAgentIcon(color)
      })

      marker.addTo(this.layerGroup);
      const route = this._buildRoute(roadGraph, edge.id, routeLength);

      this.agents.push({
        id,
        pos: { lat, lng },
        edgeId: edge.id,
        route,
        routeIndex: 0,
        edgeOffset: edge.length * t,
        speed,
        marker,
      });
      this.agentIndex.insertPoint(id, lat, lng);
    }

    if (!this.map.hasLayer(this.layerGroup)) {
      this.layerGroup.addTo(this.map);
    }

    return this.agents;
  }

  clear() {
    this.layerGroup.clearLayers();
    this.agents = [];
    this.agentIndex = new GridIndex();
  }

  updateAgentPosition(id, lat, lng) {
    const agent = this.agents.find((a) => a.id === id);
    if (!agent) return null;
    agent.pos = { lat, lng };
    if (agent.marker) agent.marker.setLatLng([lat, lng]);
    this.agentIndex.updatePoint(id, lat, lng);
    return agent;
  }

  step(deltaSeconds) {
    if (!deltaSeconds || deltaSeconds <= 0) return;
    const roadGraph = this.roadManager.getRoadGraph();
    if (!roadGraph || !roadGraph.edges || roadGraph.edges.length === 0) return;

    for (const agent of this.agents) {
      if (!agent.route || agent.route.length === 0) continue;

      let remaining = agent.speed * deltaSeconds;
      while (remaining > 0) {
        const currentEdgeId = agent.route[agent.routeIndex];
        const edge = roadGraph.edges[currentEdgeId];
        if (!edge) break;

        const available = Math.max(0, edge.length - agent.edgeOffset);
        if (remaining < available) {
          agent.edgeOffset += remaining;
          remaining = 0;
        } else {
          remaining -= available;
          agent.routeIndex += 1;
          agent.edgeOffset = 0;
          if (agent.routeIndex >= agent.route.length) {
            agent.routeIndex = agent.route.length - 1;
            agent.edgeOffset = edge.length;
            remaining = 0;
          }
        }

        const activeEdgeId = agent.route[agent.routeIndex];
        const activeEdge = roadGraph.edges[activeEdgeId];
        if (!activeEdge) break;
        const [[lng1, lat1], [lng2, lat2]] = activeEdge.geom;
        const t = activeEdge.length > 0 ? agent.edgeOffset / activeEdge.length : 0;
        const lat = lat1 + (lat2 - lat1) * t;
        const lng = lng1 + (lng2 - lng1) * t;
        agent.pos = { lat, lng };
        if (agent.marker) agent.marker.setLatLng([lat, lng]);
        this.agentIndex.updatePoint(agent.id, lat, lng);
      }
    }
  }

  getAgentsData() {
    return this.agents;
  }
}
