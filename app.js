// =============================
// CanICannabis Frontend (Leaflet) - FIXED OVERLAP
// =============================

const API_BASE = "http://127.0.0.1:8000"; // change if needed

// ----- Map init -----
const map = L.map("map").setView([49.0069, 8.4037], 12); // Karlsruhe start

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ----- FIXED OVERLAP: Add panes like second code -----
map.createPane('redPane');
map.createPane('bluePane');

map.getPane('redPane').style.opacity = '0.40';
map.getPane('bluePane').style.opacity = '0.40';

map.getPane('redPane').style.zIndex = 450;
map.getPane('bluePane').style.zIndex = 460;

// ----- Layers -----
let redLayer = null;
let blueLayer = null;

let redEnabled = false;
let blueEnabled = false;

function bboxParamsFromMap() {
  const b = map.getBounds();
  const west = b.getWest();
  const south = b.getSouth();
  const east = b.getEast();
  const north = b.getNorth();

  const params = new URLSearchParams({
    west: west.toString(),
    south: south.toString(),
    east: east.toString(),
    north: north.toString(),
    limit: "5000" // adjust if needed
  });

  return params.toString();
}

async function fetchGeoJSON(path) {
  const url = `${API_BASE}${path}?${bboxParamsFromMap()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return await res.json();
}

function clearLayer(layerRefName) {
  if (layerRefName === "red" && redLayer) {
    map.removeLayer(redLayer);
    redLayer = null;
  }
  if (layerRefName === "blue" && blueLayer) {
    map.removeLayer(blueLayer);
    blueLayer = null;
  }
}

async function loadRed() {
  try {
    const data = await fetchGeoJSON("/zones/red");

    clearLayer("red");
    redLayer = L.geoJSON(data, {
      pane: 'redPane',  // FIXED: Use pane
      style: {
        weight: 1,
        opacity: 1,
        fillOpacity: 1,  // FIXED: Opaque polygons (opacity on pane)
        color: "#b00000",
        fillColor: "#ff0000"
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        layer.bindPopup(
          `<b>RED zone</b><br>` +
          `Restriction: ${p.restriction ?? "N/A"}<br>` +
          `Color: ${p.color ?? "red"}`
        );
      }
    }).addTo(map);
  } catch (err) {
    console.error(err);
    alert("Failed to load red zones. Check console + backend.");
  }
}

async function loadBlue() {
  try {
    const data = await fetchGeoJSON("/zones/blue");

    clearLayer("blue");
    blueLayer = L.geoJSON(data, {
      pane: 'bluePane',  // FIXED: Use pane
      style: {
        weight: 1,
        opacity: 1,
        fillOpacity: 1,  // FIXED: Opaque polygons (opacity on pane)
        color: "#0038a8",
        fillColor: "#0066ff"
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        layer.bindPopup(
          `<b>BLUE zone</b><br>` +
          `Restriction: ${p.restriction ?? "N/A"}<br>` +
          `Color: ${p.color ?? "blue"}`
        );
      }
    }).addTo(map);
  } catch (err) {
    console.error(err);
    alert("Failed to load blue zones. Check console + backend.");
  }
}

// ----- Buttons (unchanged) -----
document.getElementById("loadRed").addEventListener("click", async () => {
  redEnabled = !redEnabled;

  if (redEnabled) {
    document.getElementById("loadRed").innerText = "Hide red zones";
    await loadRed();
  } else {
    document.getElementById("loadRed").innerText = "Show red zones";
    clearLayer("red");
  }
});

document.getElementById("loadBlue").addEventListener("click", async () => {
  blueEnabled = !blueEnabled;

  if (blueEnabled) {
    document.getElementById("loadBlue").innerText = "Hide blue zones";
    await loadBlue();
  } else {
    document.getElementById("loadBlue").innerText = "Show blue zones";
    clearLayer("blue");
  }
});

// ----- Auto refresh on move/zoom (unchanged) -----
let refreshTimer = null;
map.on("moveend", () => {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    if (redEnabled) await loadRed();
    if (blueEnabled) await loadBlue();
  }, 250);
});

// ----- Search (Nominatim, unchanged) -----
let searchMarker = null;

async function searchAddress(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=de&limit=1`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });
  if (!res.ok) throw new Error("Search failed");
  const results = await res.json();
  if (!results.length) return null;
  return results[0];
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) return;

  try {
    const r = await searchAddress(q);
    if (!r) {
      alert("No results found.");
      return;
    }

    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);

    map.setView([lat, lon], 16);

    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker([lat, lon]).addTo(map).bindPopup(r.display_name).openPopup();

    if (redEnabled) await loadRed();
    if (blueEnabled) await loadBlue();
  } catch (err) {
    console.error(err);
    alert("Search failed. Check console.");
  }
});
