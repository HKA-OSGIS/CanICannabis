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
 ```
OpenStreetMap Data (Geofabrik)
↓
osm2pgsql Import
↓
PostgreSQL/PostGIS Database
↓
SQL + PostGIS Logic (red_small, blue_small zones)
↓
FastAPI Backend (/zones/red, /zones/blue endpoints)
↓
 Frontend (Leaflet + JavaScript)
↓
Web Browser Map
```
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
## Project Structure
```
CanICannabis/
├── backend/
│   ├── api.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── sql/
│       ├── import_osm.sql  # Import OSM data into PostGIS
│       └── create_zones.sql# Create red/blue zone tables
├── frontend/
│   ├── map.html            # Web map interface
│   └── app.js              # Frontend logic (requests + map)
├── docs/
│   ├── screenshots/        # UI screenshots
│   └── API_DOCS.md         # API documentation
├── README.md               # Project overview & setup
└── LICENSE                 # Project license 
```
## How to Run
### Prerequisites
OSGeoLive VM or Linux system with:
- PostgreSQL 15 + PostGIS
- Python 3.8+
- Git
### Backend Setup (FastAPI + PostGIS)
#### 1. Start OSGeoLive and PostgreSQL
PostgreSQL should auto-start in OSGeoLive. Verify it's running:

sudo systemctl status postgresql
#### 2. Create Database and Import OSM Data (one-time setup)
Create database:

sudo -u postgres createdb canicannabis

Import Karlsruhe OSM data:

osm2pgsql -d canicannabis --slim -C 2048 karlsruhe.osm.pbf

Connect to database and run zone creation SQL:

sudo -u postgres psql canicannabis < sql/create_zones.sql
#### 3. Install Python Dependencies
cd backend 

pip install -r requirements.txt 

Example requirements.txt:

fastapi 

0.104.1uvicorn0.24.0 

psycopg2-binary 

2.9.9pydantic2.5.0
#### 4. Start FastAPI Backend
cd backend 

uvicorn api:app --reload --port 8000

###### Output:

INFO: Uvicorn running on http://127.0.0.1:8000 
INFO: Application startup complete
#### 5. Test Backend Endpoints
Open in browser: 
- http://localhost:8000/zones/red – Returns red zone GeoJSON
- http://localhost:8000/zones/blue – Returns blue zone GeoJSON
  
Response format:
```
{
"type":"FeatureCollection",
"features": [
{
"type": "Feature",
"geometry": {
"type": "MultiPolygon",
"coordinates": [...]
},
"properties": {
"restriction": "Cannabis consumption forbidden (100m from school)"
}
}
]
}
```
### Frontend Setup (Leaflet + HTML)
#### 1. Open Map in Browser

cd frontend 

firefox map.html

Or navigate directly:

file:///path/to/canicannabis/frontend/map.html
#### 2. Features Available
1. Map Display: Karlsruhe centered, OpenStreetMap tiles
2. Zone Layers:
- Red zones load automatically (forbidden zones)
- Blue zones toggle via "Show/Hide Zones" button
3. Address Search:
- Type address in search box (e.g., "KIT Karlsruhe")
- Click "Search"
- Map zooms and places marker
- See which zones apply
4. Popups: Click any polygon to see restriction details
## Usage Examples
#### Example 1: Check a Specific Location
1. Open map.html
2. Type "Schlossplatz Karlsruhe" in search box
3. Click "Search"
4. Map zooms to location
5. Check if area is in red (forbidden) or blue (allowed) zones
#### Example 2: Toggle Zone Visibility
1. Click "Show/Hide Blue Zones" button
2. Blue zones appear/disappear on map
3. Compare allowed vs. forbidden areas
#### Example 3: View Zone Restrictions
1. Click on any polygon (red or blue)
2. Popup shows restriction text
3. Close popup by clicking X or clicking elsewhere
## API Documentation 
### GET /zones/red
Description: Fetch all restricted cannabis consumption zones (100m from schools)

Response: GeoJSON FeatureCollection

Example:

curl http://localhost:8000/zones/red | jq
### GET /zones/blue

Description: Fetch allowed cannabis consumption zones (outside restricted areas)

Response: GeoJSON FeatureCollection

Example:

curl http://localhost:8000/zones/blue | jq
### Query Parameters
Both endpoints support optional filtering: 
- limit: Maximum number of features to return

## Development
### Modifying Zone Rules
Edit sql/create_zones.sql to change distance buffers or restriction logic:

-- Example: Change school buffer from 100m to 150m 

UPDATE red_small SET geom = ST_Buffer(school_point, 150) 

WHERE zone_type = 'school';

Restart FastAPI after database changes:
Stop: Ctrl+C

Restart: uvicorn api:app --reload --port 8000
### Adding New Layers
1. Create new zone table in PostgreSQL
2. Add new endpoint in api.py:
   @app.get("/zones/other")
    def get_other_zones():
    #Query database
    #Return GeoJSON
3. Load in frontend app.js:

   fetch('http://localhost:8000/zones/other')

   .then(r => r.json())

   .then(data => L.geoJSON(data).addTo(map));
## Deployment
### Local Testing (Current Setup)
-  Running on OSGeoLive
-  Backend at http://localhost:8000
-  Frontend via file:// protocol or HTTP server
### Production Deployment (Future) 
For deployment to a server: 

1. Environment Configuration: Use .env file for database credentials, API URLs

2. Docker Containers: Optional containerization for FastAPI + PostgreSQL

3. Reverse Proxy: Nginx/Apache for HTTPS
   
4. CI/CD Pipeline: GitHub Actions for automated testing and deployment

5. Monitoring: Logs and error tracking
## Testing
### Manual Testing Checklist
- [ ] Backend starts without errors (uvicorn)
- [ ] /zones/red returns valid GeoJSON
- [ ] /zones/blue returns valid GeoJSON
- [ ] Frontend loads in browser
- [ ] Map displays correctly
- [ ] Red zones visible by default
- [ ] Blue zones toggle on/off
- [ ] Search finds addresses in Karlsruhe
- [ ] Clicking polygons shows popups
- [ ] Search result zooms to correct location   
### Automated Testing (Future)
- Unit tests for FastAPI endpoints
- Integration tests for database queries
- Frontend tests with Selenium or Cypress
## Troubleshooting
### Backend Issues
| Problem | Solution |
| -------- | -------- |
| Error: address already in use :8000   | Change port: uvicorn api:app --port 8001   |
| psycopg2 connection refused   | Check PostgreSQL is running: sudo systemctl start postgresql   |
| No module named 'fastapi'| Install dependencies: pip install -r requirements.txt |
### Frontend Issues
| Column 1 | Column 2 |
| -------- | -------- |
| 404 in browser console    | Backend not running; start with uvicorn   |
| CORS error   | Add CORS headers in FastAPI: from fastapi.middleware.cors import CORSMiddleware   |
| Search not working | Check Nominatim internet connection |

## Contributing
To contribute to this project:

1. Fork the repository

2. Create a branch: git checkout -b feature/my-feature

3. Make changes and test locally

4. Commit: git commit -m "Add feature description"

5. Push: git push origin feature/my-feature

6. Open a Pull Request

## Team
- **Sami** – Project Lead, Backend Architecture
- **Jomert** – Backend Development, PostGIS Queries
- **Mustafa** – Frontend Development, Leaflet Integration
- **Brenda** – Data Management, Documentation

## References
### Legal Basis
- German Cannabis Act (Cannabisgesetz – CanG), § 5: Distance regulations
- https://www.gesetze-im-internet.de/canag/
### Technologies
- Leaflet.js: https://leafletjs.com/
- FastAPI: https://fastapi.tiangolo.com/
- PostGIS: https://postgis.net/
- OpenStreetMap: https://www.openstreetmap.org/
- Nominatim: https://nominatim.openstreetmap.org/
### Related Projects
- OSGeoLive: https://live.osgeo.org/
- GeoJSON Specification: https://datatracker.ietf.org/doc/html/rfc7946
### License
This project is licensed under the MIT License. See LICENSE file for details.
### Changelog
##### Version 1.0 (December 2025)
- Core map functionality implemented
- Red and blue zone visualization
- Address search with Nominatim
- Interactive popups on zone clicks
- GitHub repository and README

