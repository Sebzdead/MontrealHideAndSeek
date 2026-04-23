import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import * as React from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  MENU_ITEM_CLASSNAME,
  SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  hiderModeEnabled,
  isLoading,
  questionModified,
  questions,
  triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { fetchLocalLandmarks } from "@/maps/api/landmarks";
import {
  determineUnionizedStrings,
  type MatchingQuestion,
  matchingQuestionSchema,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const MatchingQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: MatchingQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderModeEnabled);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);

    const [landmarks, setLandmarks] = React.useState<{ [key: string]: string }>({});

    React.useEffect(() => {
        if (data.type === "park" || data.type === "hospital" || data.type === "university") {
            fetchLocalLandmarks(data.type).then((features) => {
                const options: { [key: string]: string } = {
                    __default__: "Map Pin Location (Default)"
                };
                const names: string[] = [];
                for (const f of features) {
                    if (f.properties?.Name && !names.includes(f.properties.Name)) {
                        names.push(f.properties.Name);
                    }
                }
                names.sort((a, b) => a.localeCompare(b));
                for (const name of names) {
                    options[name] = name;
                }
                setLandmarks(options);
            });
        }
    }, [data.type]);

    const label = `Matching
    ${$questions
            .filter((q) => q.id === "matching")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
        }`;

    const airportCoords = {
        trudeau: [-73.7408, 45.4706],
        metropolitan: [-73.4169, 45.5175],
    };

    const nearestAirport = (() => {
        if (data.type !== "airport") return null;
        const pin = turf.point([data.lng, data.lat]);
        const distT = turf.distance(pin, turf.point(airportCoords.trudeau));
        const distM = turf.distance(pin, turf.point(airportCoords.metropolitan));
        return distT < distM ? "trudeau" : "metropolitan";
    })();

    return (
        <QuestionCard
            questionKey={questionKey}
            label={label}
            sub={sub}
            className={className}
            collapsed={data.collapsed}
            setCollapsed={(collapsed) => {
                data.collapsed = collapsed; // Doesn't trigger a re-render so no need for questionModified
            }}
            locked={!data.drag}
            setLocked={(locked) => questionModified((data.drag = !locked))}
        >
        <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
            <Select
                trigger="Matching Type"
                options={Object.fromEntries(
                    matchingQuestionSchema.options
                        .flatMap((x) =>
                            determineUnionizedStrings(x.shape.type),
                        )
                        .map((x) => [(x._def as any).value, x.description]),
                )}
                value={data.type}
                onValueChange={async (value) => {
                    questionModified((data.type = value as any));
                }}
                disabled={!data.drag || $isLoading}
            />
        </SidebarMenuItem>

        {data.type === "metro-line" && (
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Metro Line"
                    options={{
                        green: "Green",
                        orange: "Orange",
                        yellow: "Yellow",
                        blue: "Blue",
                        rem: "REM",
                    }}
                    value={(data as any).metroLine || "green"}
                    onValueChange={(value) => {
                        questionModified(((data as any).metroLine = value));
                    }}
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>
        )}

        {(data.type === "park" || data.type === "hospital" || data.type === "university") && (
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Location"
                    options={landmarks}
                    value={(data as any).poiId || "__default__"}
                    onValueChange={(value) => {
                        questionModified(((data as any).poiId = value === "__default__" ? "" : value));
                    }}
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>
        )}

            <LatitudeLongitude
                latitude={data.lat}
                longitude={data.lng}
                colorName={data.color}
                onChange={(lat, lng) => {
                    if (lat !== null) {
                        data.lat = lat;
                    }
                    if (lng !== null) {
                        data.lng = lng;
                    }
                    questionModified();
                }}
                disabled={!data.drag || $isLoading}
            />
            
            <div
                className={cn(
                    "flex gap-2 items-center p-2",
                )}
            >
                <Label
                    className={cn(
                        "font-semibold text-lg",
                        $isLoading && "text-muted-foreground",
                    )}
                >
                    {data.type === "airport" ? "Closer Airport" : "Result"}
                </Label>
                {data.type === "airport" ? (
                    <ToggleGroup
                        className="grow"
                        type="single"
                        value={
                            nearestAirport === "metropolitan"
                                ? data.same
                                    ? "metropolitan"
                                    : "trudeau"
                                : data.same
                                ? "trudeau"
                                : "metropolitan"
                        }
                        onValueChange={(value) => {
                            if (value === "metropolitan") {
                                questionModified(
                                    (data.same = nearestAirport === "metropolitan"),
                                );
                            } else if (value === "trudeau") {
                                questionModified(
                                    (data.same = nearestAirport === "trudeau"),
                                );
                            }
                        }}
                        disabled={$hiderMode || !data.drag || $isLoading}
                    >
                        <ToggleGroupItem value="metropolitan">
                            Metropolitan
                        </ToggleGroupItem>
                        <ToggleGroupItem value="trudeau">
                            Trudeau
                        </ToggleGroupItem>
                    </ToggleGroup>
                ) : (
                    <ToggleGroup
                        className="grow"
                        type="single"
                        value={data.same ? "same" : "different"}
                        onValueChange={(value) => {
                            if (value === "same") {
                                questionModified((data.same = true));
                            } else if (value === "different") {
                                questionModified((data.same = false));
                            }
                        }}
                        disabled={$hiderMode || !data.drag || $isLoading}
                    >
                        <ToggleGroupItem value="different">
                            Different
                        </ToggleGroupItem>
                        <ToggleGroupItem value="same">Same</ToggleGroupItem>
                    </ToggleGroup>
                )}
            </div>
        </QuestionCard>
    );
};
