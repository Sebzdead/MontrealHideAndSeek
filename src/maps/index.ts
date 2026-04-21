import type { Feature, FeatureCollection } from "geojson";

import {
    adjustPerMatching,
    matchingPlanningPolygon,
} from "./questions/matching";
import {
    adjustPerMeasuring,
    measuringPlanningPolygon,
} from "./questions/measuring";
import { adjustPerRadius, radiusPlanningPolygon } from "./questions/radius";
import {
    adjustPerTentacle,
    tentaclesPlanningPolygon,
} from "./questions/tentacles";
import {
    adjustPerThermometer,
    thermometerPlanningPolygon,
} from "./questions/thermometer";
import type { Question, Questions } from "./schema";

export * from "./geo-utils";

export const determinePlanningPolygon = async (
    question: Question,
    planningModeEnabled: boolean,
) => {
    if (planningModeEnabled && question.data.drag) {
        switch (question.id) {
            case "radius":
                return radiusPlanningPolygon(question.data);
            case "thermometer":
                return thermometerPlanningPolygon(question.data);
            case "tentacles":
                return tentaclesPlanningPolygon(question.data);
            case "matching":
                return matchingPlanningPolygon(question.data);
            case "measuring":
                return measuringPlanningPolygon(question.data);
        }
    }
};

export async function adjustMapGeoDataForQuestion(
    question: any,
    mapGeoData: any,
) {
    try {
        switch (question?.id) {
            case "radius":
                return await adjustPerRadius(question.data, mapGeoData);
            case "thermometer":
                return await adjustPerThermometer(question.data, mapGeoData);
            case "tentacles":
                if (question.data.location === false) {
                    return adjustPerRadius(
                        { ...question.data, within: false },
                        mapGeoData,
                    );
                }
                return await adjustPerTentacle(question.data, mapGeoData);
            case "matching":
                return await adjustPerMatching(question.data, mapGeoData);
            case "measuring":
                return await adjustPerMeasuring(question.data, mapGeoData);
            default:
                return mapGeoData;
        }
    } catch {
        return mapGeoData;
    }
}

export async function applyQuestionsToMapGeoData(
    questions: Questions,
    mapGeoData: any,
    planningModeEnabled: boolean,
    planningModeCallback?: (
        polygon: FeatureCollection | Feature,
        question: any,
    ) => void,
): Promise<any> {
    for (const question of questions) {
        if (planningModeCallback) {
            const planningPolygon = await determinePlanningPolygon(
                question,
                planningModeEnabled,
            );
            if (planningPolygon) {
                planningModeCallback(planningPolygon, question);
            }
        }
        if (planningModeEnabled && question.data.drag) {
            continue;
        }

        mapGeoData = await adjustMapGeoDataForQuestion(question, mapGeoData);

        if (mapGeoData.type !== "FeatureCollection") {
            mapGeoData = {
                type: "FeatureCollection",
                features: [mapGeoData],
            };
        }
    }
    return mapGeoData;
}
