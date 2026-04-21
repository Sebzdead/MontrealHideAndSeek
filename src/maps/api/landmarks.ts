import * as turf from "@turf/turf";

export const fetchLocalLandmarks = async (category: string) => {
    const res = await fetch("/final_landmarks.geojson");
    const json = await res.json();

    let keywords = [category];
    if (category === "airport") keywords = ["Airport"];
    else if (category === "university") keywords = ["University", "College"];
    else if (category === "river") keywords = ["River", "Fleuve"];
    else if (category === "hospital") keywords = ["Hospital"];
    else if (category === "park") keywords = ["Park", "Parc"];

    return json.features
        .filter((f: any) =>
            keywords.some((k) => f.properties.Name?.includes(k)),
        )
        .map((f: any) => turf.point(f.geometry.coordinates));
};
