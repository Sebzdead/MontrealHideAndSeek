import geopandas as gpd
import fiona
import os
import zipfile

# Enable KML support in the engine
fiona.drvsupport.supported_drivers['KML'] = 'rw'

def smart_convert(input_file):
    output_name = "final_landmarks.geojson"
    
    # 1. Handle KMZ by unzipping to get the internal KML
    if input_file.lower().endswith(".kmz"):
        print(f"📦 Unzipping {input_file}...")
        with zipfile.ZipFile(input_file, 'r') as z:
            z.extract('doc.kml')
            temp_kml = 'doc.kml'
    else:
        temp_kml = input_file

    # 2. Try to read the file
    print(f"🔍 Reading layers from {temp_kml}...")
    try:
        # Google KMLs can have multiple 'layers' (folders)
        layers = fiona.listlayers(temp_kml)
        if not layers:
            print("❌ Error: No layers found. This might be a 'Network Link' file with no data.")
            return

        all_layers = []
        for layer in layers:
            print(f"  -> Found layer: {layer}")
            df = gpd.read_file(temp_kml, layer=layer)
            all_layers.append(df)

        # 3. Combine all layers into one GeoJSON
        final_gdf = gpd.pd.concat(all_layers, ignore_index=True)
        
        # Save to the current folder
        final_gdf.to_file(output_name, driver='GeoJSON')
        print(f"✨ SUCCESS! Created: {output_name}")
        print(f"📍 Total landmarks found: {len(final_gdf)}")

    except Exception as e:
        print(f"💥 Failed to convert: {e}")
    finally:
        # Clean up temp file
        if input_file.lower().endswith(".kmz") and os.path.exists('doc.kml'):
            os.remove('doc.kml')

if __name__ == "__main__":
    smart_convert("locations.kmz")