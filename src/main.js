import RoadManager from "./core/road.manager.js";
import AgentManager from "./core/agent.manager.js";

export default class AgentTraffic {
	constructor(mapInstance, roadsDataUrl) {
		if (!mapInstance) {
			throw new Error("mapInstance is required");
		}
		if (!roadsDataUrl) {
			throw new Error("roadsDataUrl is required");
		}

		this.map = mapInstance;
		this.roadsDataUrl = roadsDataUrl;
		this.roadManager = new RoadManager(this.map, this.roadsDataUrl);
		this.agentManager = new AgentManager(this.map, this.roadManager);
		this.state = "paused";
		this._rafId = null;
		this._lastTs = null;
	}

	async generateRoads(bounds) {
    this.agentManager.clear();
		return this.roadManager.render(bounds);
	}

	async generateAgents(amount, options) {
    return this.agentManager.createAgents(amount, options);
	}

	play() {
		if (this.state === "playing") return;
		this.state = "playing";
		this._lastTs = null;
		const tick = (ts) => {
			if (this.state !== "playing") return;
			if (this._lastTs == null) this._lastTs = ts;
			const deltaSeconds = (ts - this._lastTs) / 1000;
			this._lastTs = ts;
			this.agentManager.step(deltaSeconds);
			this._rafId = requestAnimationFrame(tick);
		};
		this._rafId = requestAnimationFrame(tick);
	}

	pause() {
		this.state = "paused";
		if (this._rafId) cancelAnimationFrame(this._rafId);
		this._rafId = null;
		this._lastTs = null;
	}

	clear() {
		this.pause();
		this.roadManager.clear();
		this.agentManager.clear();
	}
}

export { RoadManager, AgentManager };
