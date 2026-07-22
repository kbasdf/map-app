const map = L.map('map').setView([22.9734, 78.6569], 5);

const squares = [
  L.polygon([
    [36.177, 72.60],[32.40238,73.220],[32.3838,79.966],[36.76,80.559]
  ]),
  L.polygon([
    [32.402,73.220],[28.5061,71.15],[28.28,91.61093],[32.38,79.96]
  ]),
  L.polygon([
    [28.5061,71.15],[22.162,67.27037],[23.538,93.9891],[28.280,91.61093]
  ]),
  L.polygon([
    [22.162,67.27037],[19.34869,72.29794],[19.34,86.62411],[23.538,93.9891]
  ]),
  L.polygon([
    [19.34869,72.29794],[8.7853,75.110],[8.00277,77.83505],[19.34,86.62411]
  ])
];

// Debug overlay
squares.forEach(sq => sq.addTo(map).setStyle({color:'red', fillOpacity:0.1}));

function findSquare(latlng) {
  const pt = turf.point([latlng.lng, latlng.lat]);
  for (let i = 0; i < squares.length; i++) {
    const poly = squares[i].toGeoJSON();
    if (turf.booleanPointInPolygon(pt, poly)) {
      return squares[i];
    }
  }
  return null;
}

function placeInfoBox(latlng, text) {
  const square = findSquare(latlng);
  if (!square) return;

  const poly = square.toGeoJSON();
  const centroid = turf.centroid(poly);
  const centroidLng = centroid.geometry.coordinates[0];

  // Anchor at landmark’s longitude and polygon’s vertical span
  const bounds = square.getBounds();
  let offsetLat = latlng.lat;
  let offsetLng;

  // Decide push direction based on landmark vs centroid
  if (latlng.lng < centroidLng) {
    offsetLng = bounds.getWest();
  } else {
    offsetLng = bounds.getEast();
  }

  // Convert to screen point
  let point = map.latLngToContainerPoint([offsetLat, offsetLng]);

  // Push outward in pixels
  if (latlng.lng < centroidLng) {
    point.x -= 50; // push left
  } else {
    point.x += 50; // push right
  }

  // Convert back to lat/lng
  let offsetLatLng = map.containerPointToLatLng(point);

  // Ensure not inside any polygon
  let testPt = turf.point([offsetLatLng.lng, offsetLatLng.lat]);
  let insideAnother = squares.some(sq => turf.booleanPointInPolygon(testPt, sq.toGeoJSON()));

  while (insideAnother) {
    if (latlng.lng < centroidLng) {
      point.x -= 50;
    } else {
      point.x += 50;
    }
    offsetLatLng = map.containerPointToLatLng(point);
    testPt = turf.point([offsetLatLng.lng, offsetLatLng.lat]);
    insideAnother = squares.some(sq => turf.booleanPointInPolygon(testPt, sq.toGeoJSON()));
  }

  infoBox.style.left = point.x + "px";
  infoBox.style.top  = point.y + "px";
  infoBox.textContent = text;
}



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const landmarkIcon = L.icon({
  iconUrl: 'images/icon-1.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

let markers = [];
let infoBox;

fetch("/locations")
  .then(res => res.json())
  .then(data => {
    data.locations.forEach((loc, index) => {
      const marker = L.marker([loc.lat, loc.lon], { icon: landmarkIcon })
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.description || ""}`);
      markers.push({ marker, loc });
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers.map(m => m.marker));
      map.fitBounds(group.getBounds());

      infoBox = document.createElement("div");
      infoBox.className = "infoBox";
      infoBox.textContent = "test data";
      document.body.appendChild(infoBox);
    }
  })
  .catch(err => console.error("Error fetching locations:", err));

document.getElementById("enterBtn").addEventListener("click", () => {
  if (infoBox) {
    const input = document.getElementById("landmarkInput");
    const num = parseInt(input.value, 10);
    if (!isNaN(num) && num >= 1 && num <= markers.length) {
      const { marker, loc } = markers[num - 1];
      placeInfoBox(marker.getLatLng(), loc.name);
    }
  }
});
