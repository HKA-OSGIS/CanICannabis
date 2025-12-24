from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import json

app = FastAPI()

# ----- CORS so the HTML+JS can call the API -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # for this exercise allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- database connection -----
conn = psycopg2.connect(
    dbname="canicannabis",
    user="postgres",
    password="1234",
    host="localhost"
)
cur = conn.cursor()

# =========================
# red zone
# =========================
@app.get("/zones/red")
def red_zones():
    cur.execute("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)), zone_color, restriction FROM red_small;")
    rows = cur.fetchall()
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"color": row[1], "restriction": row[2]},
                "geometry": json.loads(row[0])
            }
            for row in rows
        ]
    }

# =========================
# blue zone
# =========================
@app.get("/zones/blue")
def blue_zones():
    cur.execute("""
        SELECT
          ST_AsGeoJSON(ST_Transform(b.geom, 4326)),
          b.zone_color,
          b.restriction
        FROM blue_small b
        WHERE NOT EXISTS (
          SELECT 1
          FROM red_small r
          WHERE ST_Intersects(b.geom, r.geom)
        );
    """)
    
    rows = cur.fetchall()

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "color": row[1],
                    "restriction": row[2]
                },
                "geometry": json.loads(row[0])
            }
            for row in rows
        ]
    }


# test endpoint
@app.get("/")
def home():
    return {"status": "Backend is running!"}

 
 
 

