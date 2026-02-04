export function createAgentIcon(status = false) {
  const colorDot = status ? "red" : "blue";

  const html = `
    <div style="
      width: 6px;
      height: 6px;
      background: ${colorDot};
      border-radius: 50%;
    "></div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [6, 6],
    iconAnchor: [3, 3],
  });
}
