import * as turf from "@turf/turf";
import _ from "lodash";
import { toast } from "react-toastify";

import {
    mapGeoLocation,
    polyGeoJSON,
} from "@/lib/context";
import {
    fetchLocalLandmarks,
    findPlacesInZone,
    LOCATION_FIRST_TAG,
    prettifyLocation,
} from "@/maps/api";
import { arcBufferToPoint, modifyMapData } from "@/maps/geo-utils";
import type {
    APILocations,
    MeasuringQuestion,
} from "@/maps/schema";

export const determineMeasuringBoundary = async (
    question: MeasuringQuestion,
) => {
    switch (question.type) {
        case "hospital":
        case "park":
        case "university":
        case "river":
        case "airport": {
            const points = await fetchLocalLandmarks(question.type);
            return [turf.combine(turf.featureCollection(points)).features[0]];
        }
        case "museum":
        case "cinema": {
            const location = question.type as APILocations;

            const data = await findPlacesInZone(
                `[${LOCATION_FIRST_TAG[location]}=${location}]`,
                `Finding ${prettifyLocation(location, true).toLowerCase()}...`,
                "nwr",
                "center",
                [],
                60,
            );

            if (data.remark && data.remark.startsWith("runtime error")) {
                toast.error(
                    `Error finding ${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()}.`,
                );
                return [turf.multiPolygon([])];
            }

            if (data.elements.length === 0) {
                toast.error(
                    `No ${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()} found.`,
                );
                return [turf.multiPolygon([])];
            }

            return [
                turf.combine(
                    turf.featureCollection(
                        data.elements.map((x: any) =>
                            turf.point([
                                x.center ? x.center.lon : x.lon,
                                x.center ? x.center.lat : x.lat,
                            ]),
                        ),
                    ),
                ).features[0],
            ];
        }
        case "custom-measure":
            return turf.combine(
                turf.featureCollection((question as any).geo.features),
            ).features;
        case "mcdonalds":
        case "rail-measure":
            return false;
    }
};

const bufferedDeterminer = _.memoize(
    async (question: MeasuringQuestion) => {
        const placeData = await determineMeasuringBoundary(question);

        if (placeData === false || placeData === undefined) return false;

        return arcBufferToPoint(
            turf.featureCollection(placeData as any),
            question.lat,
            question.lng,
        );
    },
    (question) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            entirety: polyGeoJSON.get()
                ? polyGeoJSON.get()
                : mapGeoLocation.get(),
            geo: (question as any).geo,
        }),
);

export const adjustPerMeasuring = async (
    question: MeasuringQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const buffer = await bufferedDeterminer(question);

    if (buffer === false) return mapData;

    return modifyMapData(mapData, buffer, question.hiderCloser);
};


export const measuringPlanningPolygon = async (question: MeasuringQuestion) => {
    try {
        const buffered = await bufferedDeterminer(question);

        if (buffered === false) return false;

        return turf.polygonToLine(buffered);
    } catch {
        return false;
    }
};
