const map = L.map("map").setView([20, 78], 5); // Center India

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Fetch locations from backend
fetch("/locations")
  .then(res => res.json())
  .then(data => {
    data.locations.forEach(loc => {
      // For demo, just show popup with link
      L.marker([20, 78]).addTo(map)
        .bindPopup(`KML Link: <a href="${loc}" target="_blank">${loc}</a>`);
    });
  });
