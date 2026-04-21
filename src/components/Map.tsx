import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import "leaflet-contextmenu";

import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";
import { toast } from "react-toastify";

import {
    additionalMapGeoLocations,
    addQuestion,
    animateMapMovements,
    autoZoom,
    baseTileLayer,
    followMe,
    gpsPosition,
    hiderModeEnabled,
    isLoading,
    leafletMapContext,
    mapGeoJSON,
    mapGeoLocation,
    measureDistanceEnabled,
    measurePin,
    permanentOverlay,
    planningModeEnabled,
    polyGeoJSON,
    questionFinishedMapData,
    questions,
    thunderforestApiKey,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { applyQuestionsToMapGeoData, holedMask } from "@/maps";
import { clearCache, determineMapBoundaries } from "@/maps/api";

import { DraggableMarkers } from "./DraggableMarkers";
import { LeafletFullScreenButton } from "./LeafletFullScreenButton";
import { MapPrint } from "./MapPrint";
import { PolygonDraw } from "./PolygonDraw";

const getTileLayer = (tileLayer: string, thunderforestApiKey: string) => {
    switch (tileLayer) {
        case "light":
            return (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
                    minZoom={2}
                    noWrap
                />
            );

        case "dark":
            return (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
                    minZoom={2}
                    noWrap
                />
            );

        case "transport":
            if (thunderforestApiKey)
                return (
                    <TileLayer
                        url={`https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${thunderforestApiKey}`}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>; Powered by Esri and Turf.js'
                        maxZoom={22}
                        minZoom={2}
                        noWrap
                    />
                );
            break;

        case "neighbourhood":
            if (thunderforestApiKey)
                return (
                    <TileLayer
                        url={`https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=${thunderforestApiKey}`}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>; Powered by Esri and Turf.js'
                        maxZoom={22}
                        minZoom={2}
                        noWrap
                    />
                );
            break;

        case "osmcarto":
            return (
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; Powered by Esri and Turf.js'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    minZoom={2}
                    noWrap
                />
            );
    }

    return (
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
            minZoom={2}
            noWrap
        />
    );
};

export const Map = ({ className }: { className?: string }) => {
    useStore(additionalMapGeoLocations);
    const $mapGeoLocation = useStore(mapGeoLocation);
    const $questions = useStore(questions);
    const $baseTileLayer = useStore(baseTileLayer);
    const $thunderforestApiKey = useStore(thunderforestApiKey);
    const $hiderModeEnabled = useStore(hiderModeEnabled);
    const $measureDistanceEnabled = useStore(measureDistanceEnabled);
    const $measurePin = useStore(measurePin);
    const $gpsPosition = useStore(gpsPosition);
    const $isLoading = useStore(isLoading);
    const $followMe = useStore(followMe);
    const $permanentOverlay = useStore(permanentOverlay);
    const map = useStore(leafletMapContext);

    const [metroLines, setMetroLines] = useState<any>(null);
    const [metroStops, setMetroStops] = useState<any>(null);
    const [remStations, setRemStations] = useState<any>(null);
    const [remTracks, setRemTracks] = useState<any>(null);
    const [poiData, setPoiData] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const get = async () => {
                try {
                    const l = await fetch(
                        `${import.meta.env.BASE_URL}/metro/stm_lignes_sig.json`,
                    ).then((r) => r.json());
                    setMetroLines(l);
                } catch {
                    console.error("Could not load metro lines");
                }
                try {
                    const s = await fetch(
                        `${import.meta.env.BASE_URL}/metro/stm_arrets_sig.json`,
                    ).then((r) => r.json());
                    setMetroStops(s);
                } catch {
                    console.error("Could not load metro stops");
                }
                try {
                    const r = await fetch(
                        `${import.meta.env.BASE_URL}/metro/rem_stations.geojson`,
                    ).then((res) => res.json());
                    setRemStations(r);
                } catch {
                    console.error("Could not load REM stations");
                }
                try {
                    const t = await fetch(
                        `${import.meta.env.BASE_URL}/metro/rem_tracks.geojson`,
                    ).then((res) => res.json());
                    setRemTracks(t);
                } catch {
                    console.error("Could not load REM tracks");
                }
                try {
                    const p = await fetch(
                        `${import.meta.env.BASE_URL}/final_landmarks.geojson`,
                    ).then((r) => r.json());
                    setPoiData(p);
                } catch {
                    console.error("Could not load POI data");
                }
            };
            get();
        }
    }, []);

    useEffect(() => {
        if (!map) return;

        let linesOverlay: L.GeoJSON | null = null;
        let stopsOverlay: L.GeoJSON | null = null;

        if (metroLines) {
            linesOverlay = L.geoJSON(metroLines, {
                interactive: false,
                style: (feature: any) => {
                    let color = "#000000";
                    if (feature?.properties?.route_id === 1) color = "#008a3d";
                    if (feature?.properties?.route_id === 2) color = "#e37424";
                    if (feature?.properties?.route_id === 4) color = "#ffe500";
                    if (feature?.properties?.route_id === 5) color = "#0073c6";
                    return { color, weight: 6, opacity: 0.8 };
                },
            });
            // @ts-expect-error type hint omission
            linesOverlay.permanentGeoJSON = true;
            linesOverlay.addTo(map);
            linesOverlay.bringToBack();
        }

        if (metroStops) {
            stopsOverlay = L.geoJSON(metroStops, {
                interactive: true,
                filter: (feature: any) => {
                    return ["1", "2", "4", "5"].includes(
                        String(feature?.properties?.route_id),
                    );
                },
                pointToLayer: (feature: any, latlng: any) =>
                    L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "#ffffff",
                        color: "#000000",
                        weight: 2,
                        fillOpacity: 1,
                    }),
                onEachFeature: (feature: any, layer: any) => {
                    if (feature?.properties?.stop_name) {
                        const container = L.DomUtil.create("div");
                        container.innerHTML = `
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; text-align: center;">
                                ${feature.properties.stop_name}
                            </div>
                            <button class="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md text-xs shadow-sm transition-colors w-full" type="button">
                                Set End Game Zone
                            </button>
                        `;
                        const button = container.querySelector("button");
                        if (button) {
                            button.addEventListener("click", () => {
                                map.closePopup();
                                const lng = feature.geometry.coordinates[0];
                                const lat = feature.geometry.coordinates[1];
                                addQuestion({
                                    id: "radius",
                                    data: {
                                        radius: 300,
                                        unit: "meters",
                                        lat,
                                        lng,
                                        within: true,
                                        drag: false,
                                        color: "red",
                                        collapsed: false,
                                    },
                                });
                            });
                        }
                        layer.bindPopup(container);
                    }
                },
            });
            // @ts-expect-error type hint omission
            stopsOverlay.permanentGeoJSON = true;
            stopsOverlay.addTo(map);
            stopsOverlay.bringToFront();
        }

        let remStationsOverlay: L.GeoJSON | null = null;
        if (remStations) {
            remStationsOverlay = L.geoJSON(remStations, {
                interactive: true,
                pointToLayer: (feature: any, latlng: any) =>
                    L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: "#ffffff",
                        color: "#77d132",
                        weight: 2,
                        fillOpacity: 1,
                    }),
                onEachFeature: (feature: any, layer: any) => {
                    const name =
                        feature?.properties?.name ||
                        feature?.properties?.stop_name;
                    if (name) {
                        const container = L.DomUtil.create("div");
                        container.innerHTML = `
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; text-align: center;">
                                ${name}
                            </div>
                            <button class="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-md text-xs shadow-sm transition-colors w-full" type="button">
                                Set End Game Zone
                            </button>
                        `;
                        const button = container.querySelector("button");
                        if (button) {
                            button.addEventListener("click", () => {
                                map.closePopup();
                                const lng = feature.geometry.coordinates[0];
                                const lat = feature.geometry.coordinates[1];
                                addQuestion({
                                    id: "radius",
                                    data: {
                                        radius: 300,
                                        unit: "meters",
                                        lat,
                                        lng,
                                        within: true,
                                        drag: false,
                                        color: "red",
                                        collapsed: false,
                                    },
                                });
                            });
                        }
                        layer.bindPopup(container);
                    }
                },
            });
            // @ts-expect-error type hint omission
            remStationsOverlay.permanentGeoJSON = true;
            remStationsOverlay.addTo(map);
            remStationsOverlay.bringToFront();
        }

        let remTracksOverlay: L.GeoJSON | null = null;
        if (remTracks) {
            remTracksOverlay = L.geoJSON(remTracks, {
                interactive: false,
                style: () => {
                    return { color: "#77d132", weight: 6, opacity: 0.8 };
                },
            });
            // @ts-expect-error type hint omission
            remTracksOverlay.permanentGeoJSON = true;
            remTracksOverlay.addTo(map);
            remTracksOverlay.bringToBack();
        }

        let poiOverlay: L.GeoJSON | null = null;
        if (poiData) {
            poiOverlay = L.geoJSON(poiData, {
                interactive: true,
                pointToLayer: (feature: any, latlng: any) => {
                    const name = feature?.properties?.Name || "";
                    let color = "#888888"; // Gray default
                    if (
                        name.includes("Hospital") ||
                        name.includes("Hôpital") ||
                        name.includes("Neuro") ||
                        name.includes("CHUM")
                    )
                        color = "#ff0000"; // Red
                    else if (
                        name.includes("Park") ||
                        name.includes("Parc") ||
                        name.includes("Champ-de-Mars")
                    )
                        color = "#008000"; // Green
                    else if (
                        name.includes("University") ||
                        name.includes("Université")
                    )
                        color = "#800080"; // Purple
                    else if (name.includes("River") || name.includes("Fleuve"))
                        color = "#0000ff"; // Blue
                    else if (name.includes("Airport")) color = "#000000"; // Black

                    const svgHtml = `<svg width="14.4" height="21.6" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/></svg>`;
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            className: "custom-poi-pin",
                            html: svgHtml,
                            iconSize: [14.4, 21.6],
                            iconAnchor: [7.2, 21.6],
                            popupAnchor: [0, -21.6],
                        }),
                    });
                },
                onEachFeature: (feature: any, layer: any) => {
                    const name = feature?.properties?.Name;
                    if (name) {
                        const container = L.DomUtil.create("div");
                        container.className = "min-w-[140px]";
                        container.innerHTML = `
                            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; text-align: center;">
                                ${name}
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                <button id="p-btn-radius" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Add Radius</button>
                                <button id="p-btn-thermo" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Add Thermometer</button>
                                <button id="p-btn-tent" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Add Tentacles</button>
                                <button id="p-btn-match" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Add Matching</button>
                                <button id="p-btn-meas" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Add Measuring</button>
                                <button id="p-btn-copy" class="bg-gray-100 hover:bg-gray-200 text-black font-medium px-2 py-1.5 rounded-sm text-xs shadow-sm transition-colors w-full text-left" type="button">Copy Coordinates</button>
                            </div>
                        `;

                        const lng = feature.geometry.coordinates[0];
                        const lat = feature.geometry.coordinates[1];

                        const btnRadius =
                            container.querySelector("#p-btn-radius");
                        if (btnRadius)
                            btnRadius.addEventListener("click", () => {
                                map.closePopup();
                                addQuestion({
                                    id: "radius",
                                    data: { lat, lng },
                                });
                            });

                        const btnThermo =
                            container.querySelector("#p-btn-thermo");
                        if (btnThermo)
                            btnThermo.addEventListener("click", () => {
                                map.closePopup();
                                const destination = turf.destination(
                                    [lng, lat],
                                    500,
                                    90,
                                    { units: "meters" },
                                );
                                addQuestion({
                                    id: "thermometer",
                                    data: {
                                        latA: lat,
                                        lngA: lng,
                                        latB: destination.geometry
                                            .coordinates[1],
                                        lngB: destination.geometry
                                            .coordinates[0],
                                    },
                                });
                            });

                        const btnTent = container.querySelector("#p-btn-tent");
                        if (btnTent)
                            btnTent.addEventListener("click", () => {
                                map.closePopup();
                                addQuestion({
                                    id: "tentacles",
                                    data: { lat, lng },
                                });
                            });

                        const btnMatch =
                            container.querySelector("#p-btn-match");
                        if (btnMatch)
                            btnMatch.addEventListener("click", () => {
                                map.closePopup();
                                addQuestion({
                                    id: "matching",
                                    data: { lat, lng },
                                });
                            });

                        const btnMeas = container.querySelector("#p-btn-meas");
                        if (btnMeas)
                            btnMeas.addEventListener("click", () => {
                                map.closePopup();
                                addQuestion({
                                    id: "measuring",
                                    data: { lat, lng },
                                });
                            });

                        const btnCopy = container.querySelector("#p-btn-copy");
                        if (btnCopy)
                            btnCopy.addEventListener("click", () => {
                                map.closePopup();
                                if (!navigator || !navigator.clipboard) {
                                    toast.error(
                                        "Clipboard API not supported in your browser",
                                    );
                                    return;
                                }
                                toast.promise(
                                    navigator.clipboard.writeText(
                                        `${Math.abs(lat)}°${lat > 0 ? "N" : "S"}, ${Math.abs(lng)}°${lng > 0 ? "E" : "W"}`,
                                    ),
                                    {
                                        pending: "Writing...",
                                        success: "Coordinates copied!",
                                        error: "Error copying",
                                    },
                                    { autoClose: 1000 },
                                );
                            });

                        layer.bindPopup(container);
                    }
                },
            });
            // @ts-expect-error type hint omission
            poiOverlay.permanentGeoJSON = true;
            poiOverlay.addTo(map);
            poiOverlay.bringToFront();
        }

        return () => {
            if (linesOverlay && map.hasLayer(linesOverlay))
                map.removeLayer(linesOverlay);
            if (stopsOverlay && map.hasLayer(stopsOverlay))
                map.removeLayer(stopsOverlay);
            if (remStationsOverlay && map.hasLayer(remStationsOverlay))
                map.removeLayer(remStationsOverlay);
            if (remTracksOverlay && map.hasLayer(remTracksOverlay))
                map.removeLayer(remTracksOverlay);
            if (poiOverlay && map.hasLayer(poiOverlay))
                map.removeLayer(poiOverlay);
        };
    }, [map, metroLines, metroStops, remStations, remTracks, poiData]);

    const followMeMarkerRef = useMemo(
        () => ({ current: null as L.Marker | null }),
        [],
    );
    const geoWatchIdRef = useMemo(
        () => ({ current: null as number | null }),
        [],
    );

    const refreshQuestions = async (focus: boolean = false) => {
        if (!map) return;

        if ($isLoading) return;

        isLoading.set(true);

        if ($questions.length === 0) {
            await clearCache();
        }

        let mapGeoData = mapGeoJSON.get();

        if (!mapGeoData) {
            const polyGeoData = polyGeoJSON.get();
            if (polyGeoData) {
                mapGeoData = polyGeoData;
                mapGeoJSON.set(polyGeoData);
            } else {
                await toast.promise(
                    determineMapBoundaries()
                        .then((x) => {
                            mapGeoJSON.set(x);
                            mapGeoData = x;
                        })
                        .catch((error) => console.log(error)),
                    {
                        error: "Error refreshing map data",
                    },
                );
            }
        }


        map.eachLayer((layer: any) => {
            if (layer.questionKey || layer.questionKey === 0) {
                map.removeLayer(layer);
            }
        });

        try {
            mapGeoData = await applyQuestionsToMapGeoData(
                $questions,
                mapGeoData,
                planningModeEnabled.get(),
                (geoJSONObj, question) => {
                    const geoJSONPlane = L.geoJSON(geoJSONObj);
                    // @ts-expect-error This is a check such that only this type of layer is removed
                    geoJSONPlane.questionKey = question.key;
                    geoJSONPlane.addTo(map);
                },
            );

            mapGeoData = {
                type: "FeatureCollection",
                features: [holedMask(mapGeoData!)!],
            };

            map.eachLayer((layer: any) => {
                if (layer.eliminationGeoJSON) {
                    // Hopefully only geoJSON layers
                    map.removeLayer(layer);
                }
            });

            const g = L.geoJSON(mapGeoData);
            // @ts-expect-error This is a check such that only this type of layer is removed
            g.eliminationGeoJSON = true;
            g.addTo(map);

            questionFinishedMapData.set(mapGeoData);

            if (autoZoom.get() && focus) {
                const bbox = turf.bbox(holedMask(mapGeoData) as any);
                const bounds = [
                    [bbox[1], bbox[0]],
                    [bbox[3], bbox[2]],
                ];

                if (animateMapMovements.get()) {
                    map.flyToBounds(bounds as any);
                } else {
                    map.fitBounds(bounds as any);
                }
            }
        } catch (error) {
            console.log(error);

            isLoading.set(false);
            if (document.querySelectorAll(".Toastify__toast").length === 0) {
                return toast.error("No solutions found / error occurred");
            }
        } finally {
            isLoading.set(false);
        }
    };

    const displayMap = useMemo(
        () => (
            <MapContainer
                center={$mapGeoLocation.geometry.coordinates}
                zoom={5}
                className={cn("w-[500px] h-[500px]", className)}
                ref={leafletMapContext.set}
                // @ts-expect-error Typing doesn't update from react-contextmenu
                contextmenu={true}
                contextmenuWidth={140}
                contextmenuItems={[
                    {
                        text: "Add Radius",
                        callback: (e: any) =>
                            addQuestion({
                                id: "radius",
                                data: {
                                    lat: e.latlng.lat,
                                    lng: e.latlng.lng,
                                },
                            }),
                    },
                    {
                        text: "Add Thermometer",
                        callback: (e: any) => {
                            const destination = turf.destination(
                                [e.latlng.lng, e.latlng.lat],
                                500,
                                90,
                                {
                                    units: "meters",
                                },
                            );

                            addQuestion({
                                id: "thermometer",
                                data: {
                                    latA: e.latlng.lat,
                                    lngA: e.latlng.lng,
                                    latB: destination.geometry.coordinates[1],
                                    lngB: destination.geometry.coordinates[0],
                                },
                            });
                        },
                    },
                    {
                        text: "Add Tentacles",
                        callback: (e: any) => {
                            addQuestion({
                                id: "tentacles",
                                data: {
                                    lat: e.latlng.lat,
                                    lng: e.latlng.lng,
                                },
                            });
                        },
                    },
                    {
                        text: "Add Matching",
                        callback: (e: any) => {
                            addQuestion({
                                id: "matching",
                                data: {
                                    lat: e.latlng.lat,
                                    lng: e.latlng.lng,
                                },
                            });
                        },
                    },
                    {
                        text: "Add Measuring",
                        callback: (e: any) => {
                            addQuestion({
                                id: "measuring",
                                data: {
                                    lat: e.latlng.lat,
                                    lng: e.latlng.lng,
                                },
                            });
                        },
                    },
                    {
                        text: "Copy Coordinates",
                        callback: (e: any) => {
                            if (!navigator || !navigator.clipboard) {
                                toast.error(
                                    "Clipboard API not supported in your browser",
                                );
                                return;
                            }

                            const latitude = e.latlng.lat;
                            const longitude = e.latlng.lng;

                            toast.promise(
                                navigator.clipboard.writeText(
                                    `${Math.abs(latitude)}°${latitude > 0 ? "N" : "S"}, ${Math.abs(
                                        longitude,
                                    )}°${longitude > 0 ? "E" : "W"}`,
                                ),
                                {
                                    pending: "Writing to clipboard...",
                                    success: "Coordinates copied!",
                                    error: "An error occurred while copying",
                                },
                                { autoClose: 1000 },
                            );
                        },
                    },
                ]}
            >
                {getTileLayer($baseTileLayer, $thunderforestApiKey)}
                <DraggableMarkers />
                <div className="leaflet-top leaflet-right">
                    <div className="leaflet-control flex-col flex gap-2">
                        <LeafletFullScreenButton />
                    </div>
                </div>
                <PolygonDraw />
                <ScaleControl position="bottomleft" />
                <MapPrint
                    position="topright"
                    sizeModes={["Current", "A4Portrait", "A4Landscape"]}
                    hideControlContainer={false}
                    hideClasses={[
                        "leaflet-full-screen-specific-name",
                        "leaflet-top",
                        "leaflet-control-easyPrint",
                        "leaflet-draw",
                    ]}
                    title="Print"
                />
            </MapContainer>
        ),
        [map, $baseTileLayer, $thunderforestApiKey],
    );

    useEffect(() => {
        if (!map) return;
        refreshQuestions(true);
    }, [$questions, map]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!map) return;
            let layerCount = 0;
            map.eachLayer((layer: any) => {
                if (layer.eliminationGeoJSON) {
                    // Hopefully only geoJSON layers
                    layerCount++;
                }
            });
            if (layerCount > 1) {
                console.log("Too many layers, refreshing...");
                refreshQuestions(false);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [map]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const mainElement: HTMLElement | null =
                document.querySelector("main");

            if (mainElement) {
                if (document.fullscreenElement) {
                    mainElement.classList.add("fullscreen");
                } else {
                    mainElement.classList.remove("fullscreen");
                }
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    useEffect(() => {
        if (!map) return;
        if (!$followMe) {
            if (followMeMarkerRef.current) {
                map.removeLayer(followMeMarkerRef.current);
                followMeMarkerRef.current = null;
            }
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current);
                geoWatchIdRef.current = null;
            }
            return;
        }

        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (followMeMarkerRef.current) {
                    followMeMarkerRef.current.setLatLng([lat, lng]);
                } else {
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: `<div class="text-blue-700 bg-white rounded-full border-2 border-blue-700 shadow w-5 h-5 flex items-center justify-center"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#2A81CB" opacity="0.5"/><circle cx="8" cy="8" r="3" fill="#2A81CB"/></svg></div>`,
                            className: "",
                        }),
                        zIndexOffset: 1000,
                    });
                    marker.addTo(map);
                    followMeMarkerRef.current = marker;
                }
            },
            () => {
                toast.error("Unable to access your location.");
                followMe.set(false);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
        );
        return () => {
            if (followMeMarkerRef.current) {
                map.removeLayer(followMeMarkerRef.current);
                followMeMarkerRef.current = null;
            }
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current);
                geoWatchIdRef.current = null;
            }
        };
    }, [$followMe, map]);

    // ── Hider Mode: live GPS dot ─────────────────────────────────────────────
    const hiderGpsWatchRef = useMemo(
        () => ({ current: null as number | null }),
        [],
    );
    const hiderGpsMarkerRef = useMemo(
        () => ({ current: null as L.Marker | null }),
        [],
    );

    useEffect(() => {
        if (!map) return;

        const cleanup = () => {
            if (hiderGpsWatchRef.current !== null) {
                navigator.geolocation.clearWatch(hiderGpsWatchRef.current);
                hiderGpsWatchRef.current = null;
            }
            if (hiderGpsMarkerRef.current) {
                map.removeLayer(hiderGpsMarkerRef.current);
                hiderGpsMarkerRef.current = null;
            }
            gpsPosition.set(null);
            measureDistanceEnabled.set(false);
            measurePin.set(null);
        };

        if (!$hiderModeEnabled) {
            cleanup();
            return cleanup;
        }

        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            hiderModeEnabled.set(false);
            return;
        }

        hiderGpsWatchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                gpsPosition.set({ lat, lng });

                if (hiderGpsMarkerRef.current) {
                    hiderGpsMarkerRef.current.setLatLng([lat, lng]);
                } else {
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: `<div style="
                                width:18px;height:18px;
                                background:rgba(37,99,235,0.9);
                                border:3px solid white;
                                border-radius:50%;
                                box-shadow:0 0 0 4px rgba(37,99,235,0.3);
                                animation: hider-pulse 2s ease-in-out infinite;
                            "></div>
                            <style>
                              @keyframes hider-pulse {
                                0%,100%{box-shadow:0 0 0 4px rgba(37,99,235,0.3);}
                                50%{box-shadow:0 0 0 10px rgba(37,99,235,0.05);}
                              }
                            </style>`,
                            className: "",
                            iconSize: [18, 18],
                            iconAnchor: [9, 9],
                        }),
                        zIndexOffset: 2000,
                        interactive: false,
                    });
                    marker.addTo(map);
                    // @ts-expect-error custom flag
                    marker.hiderGpsMarker = true;
                    hiderGpsMarkerRef.current = marker;
                    map.setView([lat, lng], Math.max(map.getZoom(), 13));
                }
            },
            () => {
                toast.error("Unable to access your GPS location.");
                hiderModeEnabled.set(false);
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );

        return cleanup;
    }, [$hiderModeEnabled, map]);

    // ── Measure Distance: dashed line + draggable pin ────────────────────────
    const measureLineRef = useMemo(
        () => ({ current: null as L.Polyline | null }),
        [],
    );
    const measureLabelRef = useMemo(
        () => ({ current: null as L.Marker | null }),
        [],
    );
    const measurePinMarkerRef = useMemo(
        () => ({ current: null as L.Marker | null }),
        [],
    );

    useEffect(() => {
        if (!map) return;

        const removeAll = () => {
            if (measureLineRef.current) {
                map.removeLayer(measureLineRef.current);
                measureLineRef.current = null;
            }
            if (measureLabelRef.current) {
                map.removeLayer(measureLabelRef.current);
                measureLabelRef.current = null;
            }
            if (measurePinMarkerRef.current) {
                map.removeLayer(measurePinMarkerRef.current);
                measurePinMarkerRef.current = null;
            }
        };

        if (!$measureDistanceEnabled) {
            removeAll();
            measurePin.set(null);
            return removeAll;
        }

        // Place pin at centre of map (or GPS pos) if not yet placed
        const gps = gpsPosition.get();
        const center = gps ?? { lat: map.getCenter().lat, lng: map.getCenter().lng };
        const initPin = $measurePin ?? {
            lat: center.lat + 0.003,
            lng: center.lng + 0.003,
        };

        if (!$measurePin) {
            measurePin.set(initPin);
        }

        const pinLatLng: [number, number] = [$measurePin?.lat ?? initPin.lat, $measurePin?.lng ?? initPin.lng];

        // Measure pin marker
        if (!measurePinMarkerRef.current) {
            const pinMarker = L.marker(pinLatLng, {
                draggable: true,
                icon: L.divIcon({
                    html: `<div style="
                        width:22px;height:22px;
                        background:#dc2626;
                        border:3px solid white;
                        border-radius:50%;
                        box-shadow:0 2px 6px rgba(0,0,0,0.4);
                        cursor:grab;
                    "></div>`,
                    className: "",
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                }),
                zIndexOffset: 1500,
            });
            pinMarker.addTo(map);
            // @ts-expect-error custom flag
            pinMarker.measurePin = true;
            measurePinMarkerRef.current = pinMarker;

            pinMarker.on("drag", () => {
                const ll = pinMarker.getLatLng();
                measurePin.set({ lat: ll.lat, lng: ll.lng });
            });
        } else {
            measurePinMarkerRef.current.setLatLng(pinLatLng);
        }

        // Dashed line
        const gpsLatLng: [number, number] = gps ? [gps.lat, gps.lng] : [center.lat, center.lng];
        const linePoints: [number, number][] = [gpsLatLng, pinLatLng];

        if (measureLineRef.current) {
            measureLineRef.current.setLatLngs(linePoints);
        } else {
            const line = L.polyline(linePoints, {
                color: "#dc2626",
                weight: 2,
                dashArray: "8 6",
                opacity: 0.85,
                interactive: false,
            });
            line.addTo(map);
            // @ts-expect-error custom flag
            line.measureLine = true;
            measureLineRef.current = line;
        }

        // Distance label at midpoint
        const midLat = (gpsLatLng[0] + pinLatLng[0]) / 2;
        const midLng = (gpsLatLng[1] + pinLatLng[1]) / 2;
        const distKm = map.distance(
            L.latLng(gpsLatLng[0], gpsLatLng[1]),
            L.latLng(pinLatLng[0], pinLatLng[1]),
        ) / 1000;
        const distStr = distKm < 1
            ? `${Math.round(distKm * 1000)} m`
            : `${distKm.toFixed(2)} km`;

        const labelHtml = `<div style="
            background:rgba(0,0,0,0.75);
            color:white;
            padding:2px 8px;
            border-radius:12px;
            font-size:13px;
            font-weight:600;
            white-space:nowrap;
            pointer-events:none;
        ">${distStr}</div>`;

        if (measureLabelRef.current) {
            measureLabelRef.current.setLatLng([midLat, midLng]);
            measureLabelRef.current.setIcon(L.divIcon({
                html: labelHtml,
                className: "",
                iconAnchor: [40, 12],
            }));
        } else {
            const lbl = L.marker([midLat, midLng], {
                icon: L.divIcon({
                    html: labelHtml,
                    className: "",
                    iconAnchor: [40, 12],
                }),
                interactive: false,
                zIndexOffset: 1600,
            });
            lbl.addTo(map);
            // @ts-expect-error custom flag
            lbl.measureLabel = true;
            measureLabelRef.current = lbl;
        }

        return removeAll;
    }, [$measureDistanceEnabled, $measurePin, $gpsPosition, map]);

    useEffect(() => {
        if (!map) return;

        map.eachLayer((layer: any) => {
            if (layer.permanentGeoJSON) map.removeLayer(layer);
        });

        if ($permanentOverlay === null) return;

        try {
            const overlay = L.geoJSON($permanentOverlay, {
                interactive: false,

                // @ts-expect-error Type hints force a Layer to be returned, but Leaflet accepts null as well
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                pointToLayer(geoJsonPoint, latlng) {
                    return null;
                },

                style(feature) {
                    return {
                        color: feature?.properties?.stroke,
                        weight: feature?.properties?.["stroke-width"],
                        opacity: feature?.properties?.["stroke-opacity"],
                        fillColor: feature?.properties?.fill,
                        fillOpacity: feature?.properties?.["fill-opacity"],
                    };
                },
            });
            // @ts-expect-error This is a check such that only this type of layer is removed
            overlay.permanentGeoJSON = true;
            overlay.addTo(map);
            overlay.bringToBack();
        } catch (e) {
            toast.error(`Failed to display GeoJSON overlay: ${e}`);
        }
    }, [$permanentOverlay, map]);

    return displayMap;
};
