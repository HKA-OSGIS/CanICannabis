const map = new maplibregl.Map({
  container: "map", // matches <div id="map">
  style: "https://demotiles.maplibre.org/style.json",
  center: [0, 0],
  zoom: 2,
});
const marker = new maplibregl.Marker()
  .setLngLat([8.4037, 49.0069]) // Karlsruhe
  .addTo(map);
map.on("load", async () => {
  try {
    const response = await fetch("http://localhost:3000/api/zones");
    const geojson = await response.json();

    map.addSource("postgis-zones", {
      type: "geojson",
      data: geojson
    });

    map.addLayer({
      id: "postgis-zones-layer",
      type: "fill",
      source: "postgis-zones",
      paint: {
        "fill-color": "#e63946",
        "fill-opacity": 0.4
      }
    });

  } catch (error) {
    console.error("Error loading PostGIS data:", error);
  }
});
