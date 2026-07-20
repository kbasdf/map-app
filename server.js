const express = require("express");
const fs = require("fs");
const path = require("path");
const { DOMParser } = require("xmldom");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Endpoint to parse KML and return locations
app.get("/locations", (req, res) => {
  const kmlPath = path.join(__dirname, "uploads", "oil.kml");
  const kmlData = fs.readFileSync(kmlPath, "utf8");

  const doc = new DOMParser().parseFromString(kmlData, "text/xml");

  // Extract <href> or coordinates if present
  const links = doc.getElementsByTagName("href");
  let results = [];
  for (let i = 0; i < links.length; i++) {
    results.push(links[i].textContent);
  }

  res.json({ locations: results });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
