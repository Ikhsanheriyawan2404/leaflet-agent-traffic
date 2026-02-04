export function createAgentIcon({
  color = "blue",
  icon = null,
} = {}) {
  console.log({icon})
  if (icon) {
    return L.icon({
      iconUrl: icon,
      iconSize: [15, 30],
      iconAnchor: [10, 20],
    });
  }

  return L.divIcon({
    html: `
      <div style="
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
      "></div>
    `,
    className: "",
    iconSize: [6, 6],
    iconAnchor: [3, 3],
  });
}
