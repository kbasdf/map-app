// ✅ Initialize the map
const map = L.map('map').setView([22.9734, 78.6569], 5); // Center on India

// ✅ Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Custom icon for landmarks
const landmarkIcon = L.icon({
  iconUrl: 'images/icon-1.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Store markers + labels globally
let markers = [];
let labelElements = [];
let labelsEnabled = false;

// ✅ Fetch parsed locations from backend
fetch("/locations")
  .then(res => res.json())
  .then(data => {
    data.locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lon], { icon: landmarkIcon })
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.description || ""}`);
      markers.push({ marker, loc });
    });

    // ✅ Auto‑center map on all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers.map(m => m.marker));
      map.fitBounds(group.getBounds());
    }
  })
  .catch(err => console.error("Error fetching locations:", err));

// ✅ Checkbox toggle logic
document.getElementById("highlightToggle").addEventListener("change", function (e) {
  labelsEnabled = e.target.checked;
  updateLabels();
});

// ✅ Update labels whenever zoom changes
map.on("zoomend", updateLabels);

function updateLabels() {
  // Remove existing lines + labels
  labelElements.forEach(el => map.removeLayer(el));
  labelElements = [];

  if (labelsEnabled) {
    markers.forEach((m, i) => {
      // Dynamic offset based on zoom level
      const zoom = map.getZoom();
      const baseOffset = 0.9;
      const offset = (12 - zoom) * baseOffset; 
      // smaller offset when zoomed in, larger when zoomed out

      const offsetLat = m.loc.lat + (i % 2 === 0 ? offset : -offset);
      const offsetLon = m.loc.lon + (i % 3 === 0 ? offset : -offset);

      // Leader line from landmark to label box
      const line = L.polyline([[m.loc.lat, m.loc.lon], [offsetLat, offsetLon]], {
        color: "darkred",
        weight: 1
      }).addTo(map);

      // Label box at offset position
      const labelIcon = L.divIcon({
        className: 'highlight-label-box',
        html: `<div>${m.loc.name}${m.loc.description ? " - " + m.loc.description : ""}</div>`,
        iconSize: null
      });
      const labelMarker = L.marker([offsetLat, offsetLon], { icon: labelIcon }).addTo(map);

      // Track both line + label
      labelElements.push(line);
      labelElements.push(labelMarker);
    });
  }
}
