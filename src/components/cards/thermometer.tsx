import { useStore } from "@nanostores/react";
import { bearing, destination, distance, point } from "@turf/turf";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { defaultUnit } from "@/lib/context";
import {
    hiderModeEnabled,
    isLoading,
    questionModified,
    questions,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { ThermometerQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

export const ThermometerQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: ThermometerQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderModeEnabled);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);

    let rawDefaultUnit = useStore(defaultUnit);
    if (rawDefaultUnit === ("miles" as any)) rawDefaultUnit = "kilometers";
    const DISTANCE_UNIT = rawDefaultUnit ?? "kilometers";

    const label = `Thermometer
    ${
        $questions
            .filter((q) => q.id === "thermometer")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
    }`;

    const hasCoords =
        data.latA !== null &&
        data.lngA !== null &&
        data.latB !== null &&
        data.lngB !== null;

    const distanceValue = hasCoords
        ? distance(
              point([data.lngA!, data.latA!]),
              point([data.lngB!, data.latB!]),
              { units: DISTANCE_UNIT },
          )
        : null;

    const unitLabel = DISTANCE_UNIT === "meters" ? "Meters" : "KM";

    return (
        <QuestionCard
            questionKey={questionKey}
            label={label}
            sub={sub}
            className={className}
            collapsed={data.collapsed}
            setCollapsed={(collapsed) => {
                data.collapsed = collapsed;
            }}
            locked={!data.drag}
            setLocked={(locked) => questionModified((data.drag = !locked))}
        >
            <LatitudeLongitude
                latitude={data.latA}
                longitude={data.lngA}
                label="Start"
                colorName={data.colorA}
                onChange={(lat, lng) => {
                    if (lat !== null) data.latA = lat;
                    if (lng !== null) data.lngA = lng;
                    questionModified();
                }}
                disabled={!data.drag || $isLoading}
            />

            <LatitudeLongitude
                latitude={data.latB}
                longitude={data.lngB}
                label="End"
                colorName={data.colorB}
                onChange={(lat, lng) => {
                    if (lat !== null) data.latB = lat;
                    if (lng !== null) data.lngB = lng;
                    questionModified();
                }}
                disabled={!data.drag || $isLoading}
            />

            {distanceValue !== null && (
                <div className="flex flex-col gap-2 p-2">
                    <div className="px-1 text-sm text-muted-foreground flex justify-between items-center">
                        <span>Distance:</span>
                        <span className="font-medium text-foreground">
                            {distanceValue.toFixed(3)} {unitLabel}
                        </span>
                    </div>
                    <Label
                        className={cn(
                            "font-semibold text-sm mt-1",
                            $isLoading && "text-muted-foreground",
                        )}
                    >
                        Preset Leaps
                    </Label>
                    <ToggleGroup
                        className="grow flex-wrap justify-start"
                        type="single"
                        onValueChange={(value) => {
                            if (!value) return;
                            let dt = 200;
                            let u = "meters";
                            if (value === "200m") {
                                dt = 200;
                                u = "meters";
                            } else if (value === "500m") {
                                dt = 500;
                                u = "meters";
                            } else if (value === "1km") {
                                dt = 1;
                                u = "kilometers";
                            } else if (value === "3km") {
                                dt = 3;
                                u = "kilometers";
                            }

                            const angle = bearing(
                                point([data.lngA!, data.latA!]),
                                point([data.lngB!, data.latB!]),
                            );
                            const dest = destination(
                                point([data.lngA!, data.latA!]),
                                dt,
                                angle,
                                { units: u as any },
                            );
                            data.lngB = dest.geometry.coordinates[0];
                            data.latB = dest.geometry.coordinates[1];
                            questionModified();
                        }}
                        disabled={!data.drag || $isLoading}
                    >
                        <ToggleGroupItem value="200m">200m</ToggleGroupItem>
                        <ToggleGroupItem value="500m">500m</ToggleGroupItem>
                        <ToggleGroupItem value="1km">1km</ToggleGroupItem>
                        <ToggleGroupItem value="3km">3km</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            )}

            <div className="flex gap-2 items-center p-2">
                <Label
                    className={cn(
                        "font-semibold text-lg",
                        $isLoading && "text-muted-foreground",
                    )}
                >
                    Result
                </Label>
                <ToggleGroup
                    className="grow"
                    type="single"
                    value={data.warmer ? "warmer" : "colder"}
                    onValueChange={(value: "warmer" | "colder") =>
                        questionModified((data.warmer = value === "warmer"))
                    }
                    disabled={$hiderMode || !data.drag || $isLoading}
                >
                    <ToggleGroupItem color="red" value="colder">
                        Colder
                    </ToggleGroupItem>
                    <ToggleGroupItem value="warmer">Warmer</ToggleGroupItem>
                </ToggleGroup>
            </div>
        </QuestionCard>
    );
};
