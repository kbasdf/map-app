// ✅ Initialize the map
const map = L.map('map').setView([22.9734, 78.6569], 5); // Center on India

// ✅ Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Custom icon
const landmarkIcon = L.icon({
  iconUrl: 'images/icon-1.png',   // ✅ now served from uploads
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Store markers globally so we can toggle labels later
let markers = [];

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
  if (e.target.checked) {
    // Show small text labels near markers
    markers.forEach(m => {
      const label = L.tooltip({
        permanent: true,
        direction: "right",
        offset: [10, 0],
        className: "highlight-label"
      })
        .setContent(`${m.loc.name} - ${m.loc.description || ""}`);
      m.marker.bindTooltip(label).openTooltip();
    });
  } else {
    // Remove labels
    markers.forEach(m => {
      m.marker.unbindTooltip();
    });
  }
});
