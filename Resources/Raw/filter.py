import json
import os

# Approximate bounds for Montreal and South Shore (Brossard)
BOUNDS = {
    'min_lat': 45.3,
    'max_lat': 45.75,
    'min_lng': -74.05,
    'max_lng': -73.35
}

def is_in_montreal(coords):
    # Handle single point [lng, lat]
    if isinstance(coords[0], (int, float)):
        lng, lat = coords
        return (BOUNDS['min_lat'] <= lat <= BOUNDS['max_lat'] and 
                BOUNDS['min_lng'] <= lng <= BOUNDS['max_lng'])
    # Handle list of points (LineString)
    # We keep a line if any part of it is in Montreal
    return any(is_in_montreal(c) for c in coords)

def filter_geojson(input_file):
    # Ensure paths are relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, input_file)
    
    with open(input_path, 'r') as f:
        data = json.load(f)

    stations = []
    tracks = []

    for feature in data['features']:
        props = feature.get('properties', {})
        geom = feature.get('geometry', {})
        
        # 1. Filter out non-railway "highway" noise (User request)
        if 'highway' in props:
            continue
            
        coords = geom.get('coordinates')
        if not coords or not is_in_montreal(coords):
            continue

        # 2. Identify Stations (Points with names)
        if geom['type'] == 'Point':
            if 'name' in props:
                stations.append(feature)
        
        # 3. Identify Tracks (LineStrings)
        elif geom['type'] == 'LineString':
            tracks.append(feature)

    # Save the cleaned Stations
    stations_path = os.path.join(script_dir, 'rem_stations.geojson')
    with open(stations_path, 'w') as f:
        json.dump({"type": "FeatureCollection", "features": stations}, f)

    # Save the cleaned Tracks
    tracks_path = os.path.join(script_dir, 'rem_tracks.geojson')
    with open(tracks_path, 'w') as f:
        json.dump({"type": "FeatureCollection", "features": tracks}, f)

    print(f"Done! Created 'rem_stations.geojson' ({len(stations)} points) and 'rem_tracks.geojson' ({len(tracks)} lines).")

# Use this on your export
filter_geojson("REM.geojson")