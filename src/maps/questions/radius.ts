import * as turf from "@turf/turf";

import { arcBuffer, modifyMapData } from "@/maps/geo-utils";
import type { RadiusQuestion } from "@/maps/schema";

export const adjustPerRadius = async (
    question: RadiusQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const point = turf.point([question.lng, question.lat]);
    const circle = await arcBuffer(
        turf.featureCollection([point]),
        question.radius,
        question.unit,
    );

    return modifyMapData(mapData, circle, question.within);
};

export const radiusPlanningPolygon = async (question: RadiusQuestion) => {
    const point = turf.point([question.lng, question.lat]);
    const circle = await arcBuffer(
        turf.featureCollection([point]),
        question.radius,
        question.unit,
    );

    return turf.polygonToLine(circle);
};
