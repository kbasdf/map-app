// ✅ Initialize the map
const map = L.map('map').setView([22.9734, 78.6569], 5); // Center on India

// ✅ Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Custom icon
const landmarkIcon = L.icon({
  iconUrl: 'images/icon-1.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// ✅ Fetch parsed locations from backend
fetch("/locations")
  .then(res => res.json())
  .then(data => {
    const markers = [];

    data.locations.forEach(loc => {
      const marker = L.marker([loc.lat, loc.lon], { icon: landmarkIcon })
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b>`);
      markers.push(marker);
    });

    // ✅ Auto‑center map on all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds());
    }
  })
  .catch(err => console.error("Error fetching locations:", err));
