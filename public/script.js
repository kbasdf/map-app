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

// Define reference centers
const northCenter = { lat: 20, lon: 100 };
const middleCenter = { lat: 22.97, lon: 78.65 };
const southCenter = { lat: 10, lon: 78 };

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
  labelElements.forEach(el => map.removeLayer(el));
  labelElements = [];

  if (labelsEnabled) {
    markers.forEach((m) => {
      const text = `${m.loc.name}${m.loc.description ? " - " + m.loc.description : ""}`;
      const textLength = text.length;

      if (textLength > 20) {
        const zoom = map.getZoom();
        const baseOffset = 1.0;
        const offset = (12 - zoom) * baseOffset;

        let offsetLat = m.loc.lat;
        let offsetLon = m.loc.lon;

        // Zone logic — only horizontal lines
        if (m.loc.lat >= 23) {
          // North India
          offsetLon = m.loc.lon + (m.loc.lon >= northCenter.lon ? offset : -offset);
        } else if (m.loc.lat <= 15) {
          // South India
          if (m.loc.lat <= southCenter.lat) {
            offsetLon = m.loc.lon + offset; // push right
          } else {
            offsetLon = m.loc.lon - offset; // push left
          }
        } else {
          // Middle India
          offsetLon = m.loc.lon + (m.loc.lon >= middleCenter.lon ? offset : -offset);
        }

        // Leader line
        const line = L.polyline([[m.loc.lat, m.loc.lon], [offsetLat, offsetLon]], {
          color: "darkred",
          weight: 1
        }).addTo(map);

        // Label box
        const labelIcon = L.divIcon({
          className: 'highlight-label-box',
          html: `<div>${text}</div>`,
          iconSize: null
        });
        const labelMarker = L.marker([offsetLat, offsetLon], { icon: labelIcon }).addTo(map);

        labelElements.push(line);
        labelElements.push(labelMarker);
      } else {
        // Short text → box directly at marker
        const labelIcon = L.divIcon({
          className: 'highlight-label-box',
          html: `<div>${text}</div>`,
          iconSize: null
        });
        const labelMarker = L.marker([m.loc.lat, m.loc.lon], { icon: labelIcon }).addTo(map);

        labelElements.push(labelMarker);
      }
    });
  }
}
