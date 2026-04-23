import * as turf from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import _ from "lodash";
import { toast } from "react-toastify";

import {
    mapGeoLocation,
    polyGeoJSON,
} from "@/lib/context";
import {
    fetchLocalLandmarks,
    loadLocalStations,
} from "@/maps/api";
import { geoSpatialVoronoi, modifyMapData, safeUnion } from "@/maps/geo-utils";
import type {
    MatchingQuestion,
} from "@/maps/schema";

export const findMatchingPlaces = async (question: MatchingQuestion) => {
    switch (question.type) {
        case "airport": {
            // Hardcoded airports as requested
            return [
                turf.point([-73.7408, 45.4706], { name: "Trudeau International Airport" }),
                turf.point([-73.4169, 45.5175], { name: "Montreal Metropolitan Airport" })
            ];
        }
        case "hospital":
        case "park":
        case "university": {
            return await fetchLocalLandmarks(question.type);
        }
        default:
            return [];
    }
};

export const determineMatchingBoundary = _.memoize(
    async (question: MatchingQuestion) => {
        let boundary;

        switch (question.type) {
            case "metro-line": {
                const selectedLine = (question as any).metroLine || "green";
                const stations = await loadLocalStations();

                const excludedStations = stations.filter((s) => {
                    const metroLines = (s.properties as any).metroLines || "";
                    const lines = metroLines.split(",").map((l: string) => l.trim());
                    const isOnLine = lines.includes(selectedLine);
                    return question.same ? !isOnLine : isOnLine;
                });

                if (excludedStations.length === 0) {
                    toast.error(`No stations found to exclude for metro line ${selectedLine}`);
                    throw new Error("No stations found");
                }

                // 300m = 0.3km
                const HIDING_RADIUS_KM = 0.3;
                const circles = excludedStations.map((station) => {
                    const center = turf.getCoord(station);
                    return turf.circle(center, HIDING_RADIUS_KM, {
                        steps: 32,
                        units: "kilometers",
                    });
                });

                boundary = safeUnion(turf.featureCollection(circles));
                break;
            }
            case "district": {
                try {
                    // Fetch the cleaned Montreal geojson to find which district we are in
                    const req = await fetch(`${import.meta.env.BASE_URL}/data/Montreal_cleaned.geojson`);
                    const geojson = await req.json() as FeatureCollection<Polygon | MultiPolygon>;
                    
                    const point = turf.point([question.lng, question.lat]);
                    
                    for (const feature of geojson.features) {
                        if (turf.booleanPointInPolygon(point, feature)) {
                            boundary = feature;
                            break;
                        }
                    }

                    if (!boundary) {
                        toast.error("Point is not within any known Montreal district.");
                        throw new Error("No boundary found");
                    }
                } catch (e) {
                    console.error("Failed to process district boundary", e);
                }
                break;
            }
            case "airport":
            case "hospital":
            case "park":
            case "university": {
                const data = await findMatchingPlaces(question);

                if (!data || data.length === 0) {
                    toast.error(`No ${question.type}s found nearby to match against.`);
                    throw new Error("No places found");
                }

                const voronoi = geoSpatialVoronoi(turf.featureCollection(data));
                const poiId = (question as any).poiId;
                const hasPoiId = poiId && poiId !== "__default__";

                if (hasPoiId) {
                    for (const feature of voronoi.features) {
                        if (feature.properties?.site?.properties?.Name === poiId) {
                            boundary = feature;
                            break;
                        }
                    }
                    if (!boundary) {
                        toast.error(`Could not find boundary for selected ${question.type}.`);
                        throw new Error("No boundary found");
                    }
                } else {
                    const point = turf.point([question.lng, question.lat]);
                    for (const feature of voronoi.features) {
                        if (turf.booleanPointInPolygon(point, feature as any)) {
                            boundary = feature;
                            break;
                        }
                    }
                }
                break;
            }
        }

        return boundary;
    },
    (question: MatchingQuestion) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            same: question.same,
            metroLine: (question as any).metroLine,
            entirety: polyGeoJSON.get()
                ? polyGeoJSON.get()
                : mapGeoLocation.get(),
        }),
);

export const adjustPerMatching = async (
    question: MatchingQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const boundary = await determineMatchingBoundary(question);

    if (!boundary || (boundary as any) === false) {
        return mapData;
    }

    if (question.type === "metro-line") {
        return modifyMapData(mapData, boundary as any, false);
    }

    return modifyMapData(mapData, boundary as any, question.same);
};
