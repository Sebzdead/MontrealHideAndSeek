import type { FeatureCollection } from "geojson";

import { adjustPerMatching } from "./questions/matching";
import { adjustPerRadius } from "./questions/radius";
import { adjustPerTentacle } from "./questions/tentacles";
import { adjustPerThermometer } from "./questions/thermometer";
import type { Questions } from "./schema";

export * from "./geo-utils";

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
): Promise<any> {
    for (const question of questions) {
        mapGeoData = await adjustMapGeoDataForQuestion(question, mapGeoData);

        if (mapGeoData.type !== "FeatureCollection") {
            mapGeoData = {
                type: "FeatureCollection",
                features: [mapGeoData],
            } as FeatureCollection;
        }
    }
    return mapGeoData;
}
