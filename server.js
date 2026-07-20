const express = require("express");
const fs = require("fs");
const path = require("path");
const { DOMParser } = require("xmldom");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/locations", (req, res) => {
  // ✅ Declare kmlPath before using it
  const kmlPath = path.join(__dirname, "uploads", "doc.kml");

  console.log("Reading KML from:", kmlPath);

  // Check if file exists
  if (!fs.existsSync(kmlPath)) {
    console.error("KML file not found!");
    return res.status(404).json({ error: "doc.kml not found" });
  }

  const kmlData = fs.readFileSync(kmlPath, "utf8");
  console.log("Raw KML length:", kmlData.length);

  const doc = new DOMParser().parseFromString(kmlData, "text/xml");
  const placemarks = doc.getElementsByTagName("Placemark");
  console.log("Placemark count:", placemarks.length);

  let results = [];
  for (let i = 0; i < placemarks.length; i++) {
    const nameNode = placemarks[i].getElementsByTagName("name")[0];
    const coordNode = placemarks[i].getElementsByTagName("coordinates")[0];

    if (coordNode) {
      const coords = coordNode.textContent.trim().split(",");
      if (coords.length >= 2) {
        results.push({
          name: nameNode ? nameNode.textContent : "Unnamed",
          lat: parseFloat(coords[1]),
          lon: parseFloat(coords[0])
        });
      }
    }
  }

  console.log("Parsed locations:", results);

  res.json({ locations: results });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
