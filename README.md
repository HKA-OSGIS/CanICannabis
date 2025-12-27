# CanICannabis
## Project Overview
CanICannabis is an open-source web mapping application that visualizes legal and prohibited cannabis consumption zones in Karlsruhe, Germany, based on the German Cannabis Act (Cannabisgesetz – CanG) § 5 distance regulations.
### Key Features:
- Interactive map showing restricted and allowed consumption zones
- Distance-based calculations from schools (100m minimum distance)
- Address search functionality with geocoding
- Toggle between zone layers (restricted/allowed)
- Full open-source stack: OpenStreetMap + PostgreSQL/PostGIS + FastAPI + Leaflet
 ## System Architecture
 The project follows a classic full-stack web GIS architecture:
1. OpenStreetMap Data (Geofabrik) 
2. osm2pgsql Import 
3. PostgreSQL/PostGIS Database 
4. SQL + PostGIS Logic (red_small, blue_small zones)
5. FastAPI Backend (/zones/red, /zones/blue endpoints)
6. Frontend (Leaflet + JavaScript)
7. Web Browser Map
## Data Pipeline
#### 1. OSM Data Import: Karlsruhe extract from Geofabrik
#### 2. Spatial Processing: PostGIS queries calculate restricted zones based on:
- School locations (buffer 100m = red_small, forbidden)
- Youth centers (buffer 100m = restrictions)
- Public transit hubs (conditional rules)
#### 3. API Endpoints: FastAPI serves GeoJSON for each zone type
#### 4. Frontend Rendering: Leaflet displays polygons with styling and interactivity
## Technology Stack
| Component | Technology |
| -------- | -------- |
| Environment  | OSGeoLive Linux Virtual Machine  |
| Database   | PostgreSQL 15 + PostGIS   |
| Backend    | Python 3 + FastAPI + psycopg2 |
| Frontend | HTML/CSS + JavaScript + Leaflet.js |
| Map Tiles | OpenStreetMap (via Leaflet) |
| Geocoding | Nominatim (OSM geocoding service) |
| Version Control | GitHub |
