import "leaflet/dist/leaflet.css";

import type { FeatureCollection } from "geojson";
import * as L from "leaflet";
import { useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";

type CuratorMapProps = {
    montrealData: FeatureCollection;
};

export const CuratorMap = ({ montrealData }: CuratorMapProps) => {
    const [montreal, setMontreal] = useState<FeatureCollection>(montrealData);
    const [isSaving, setIsSaving] = useState(false);

    // Filter out deleted features
    const removeFeature = (featureIndex: number) => {
        const newFeatures = montreal.features.filter((_, i) => i !== featureIndex);
        setMontreal({ ...montreal, features: newFeatures });
    };

    const saveData = async () => {
        setIsSaving(true);
        try {
            const dataToSave = montreal;
            const filename = 'Montreal_cleaned.geojson';
            
            const res = await fetch('/JetLagHideAndSeek/api/save-curated', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, geojson: dataToSave })
            });
            
            if (!res.ok) throw new Error("Save failed: " + await res.text());
            
            alert(`Saved ${filename} to /public/data/ successfully!`);
        } catch (e: any) {
            alert("Error saving: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Note: react-leaflet components must be rendered client-side
    return (
        <div className="relative w-full h-screen flex flex-col">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-4 bg-white/90 p-4 rounded-lg shadow-lg">
                <div className="text-center">
                    <p className="font-bold mb-2">Montreal Districts: {montreal.features.length}</p>
                    <button 
                        onClick={() => saveData()} 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                        disabled={isSaving}
                    >
                        Save Cleaned Montreal Districts
                    </button>
                </div>
            </div>
            
            <MapContainer
                center={[45.5017, -73.5673]}
                zoom={11}
                className="w-full flex-grow h-full z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {montreal.features.map((feature, i) => {
                    return (
                        <GeoJSON
                            key={`montreal-${i}`}
                            data={feature as any}
                            style={{
                                color: "blue",
                                weight: 2,
                                fillOpacity: 0.2,
                                fillColor: "blue",
                            }}
                            onEachFeature={(f, layer) => {
                                const name = f.properties?.name || f.properties?.NOM || f.properties?.NOM_ARROND || "District";
                                const container = L.DomUtil.create("div");
                                container.className = "text-center";
                                container.innerHTML = `
                                    <h3 class="font-bold mb-2">${name}</h3>
                                    <button class="bg-red-500 text-white px-3 py-1 rounded text-sm w-full p-btn-del" type="button">
                                        Delete District
                                    </button>
                                `;
                                const btnDel = container.querySelector(".p-btn-del");
                                if (btnDel) {
                                    btnDel.addEventListener("click", () => {
                                        removeFeature(i);
                                    });
                                }
                                layer.bindPopup(container);
                            }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
};
