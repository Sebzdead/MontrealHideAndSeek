import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import { useEffect, useState } from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Select } from "@/components/ui/select";
import {
  MENU_ITEM_CLASSNAME,
  SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import {
  isLoading,
  questionModified,
  questions,
  triggerLocalRefresh,
} from "@/lib/context";
import { mapToObj } from "@/lib/utils";
import { findTentacleLocations } from "@/maps/api";
import {
  type TentacleQuestion,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const TentacleQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: TentacleQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
  const $questions = useStore(questions);
  const $isLoading = useStore(isLoading);
    const label = `Tentacles
    ${
        $questions
            .filter((q) => q.id === "tentacles")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
    }`;

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
                    trigger="Location Type"
                    options={{
                        mcdonalds: "McDonald's",
                        library: "Libraries",
                    }}
                    value={data.locationType}
                    onValueChange={(value) => {
                        data.location = false;
                        data.locationType = value as any;
                        data.radius = 1;
                        data.unit = "kilometers";
                        questionModified();
                    }}
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>
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
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Hider Position"
                    options={{
                        true: "Inside Radius",
                        false: "Outside Radius",
                    }}
                    value={data.isInsideCircle ? "true" : "false"}
                    onValueChange={(value) => {
                        data.isInsideCircle = value === "true";
                        if (!data.isInsideCircle) {
                            data.location = false;
                        }
                        questionModified();
                    }}
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>
            {data.isInsideCircle && (
                <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                    <TentacleLocationSelector
                        data={data}
                        disabled={!data.drag || $isLoading}
                    />
                </SidebarMenuItem>
            )}
        </QuestionCard>
    );
};

const TentacleLocationSelector = ({
    data,
    disabled,
}: {
    data: TentacleQuestion;
    disabled: boolean;
}) => {
    const $triggerLocalRefresh = useStore(triggerLocalRefresh);
    const [locations, setLocations] = useState<any>(null);

    useEffect(() => {
        let cancelled = false;
        setLocations(null);
        const promise =
            data.locationType === "custom"
                ? Promise.resolve(turf.featureCollection(data.places))
                : findTentacleLocations(data);
        promise.then((result) => {
            if (!cancelled) {
                setLocations(result);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [data.locationType, $triggerLocalRefresh]);

    if (locations === null) {
        return (
            <div className="flex items-center justify-center w-full h-8">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
            </div>
        );
    }

    // Filter locations to only those within the radius of the primary location
    const filteredFeatures = (() => {
        if (
            data.lat === null ||
            data.lng === null ||
            data.radius === undefined ||
            data.radius === null
        ) {
            return locations.features;
        }

        const center = turf.point([data.lng, data.lat]);

        return locations.features.filter((feature: any) => {
            const coords =
                feature?.geometry?.coordinates ??
                (feature?.properties?.lon && feature?.properties?.lat
                    ? [feature.properties.lon, feature.properties.lat]
                    : null);

            if (!coords) return false;

            const pt = turf.point(coords);
            const dist = turf.distance(center, pt, { units: data.unit });

            return dist <= data.radius;
        });
    })();

    // If the currently selected location is no longer within radius, clear it.
    const _selectedLocationName = data.location
        ? data.location.properties?.name
        : null;
    if (
        _selectedLocationName &&
        !filteredFeatures.find(
            (f: any) => f.properties.name === _selectedLocationName,
        )
    ) {
        data.location = false;
        questionModified();
    }

    return (
        <Select
            trigger="Location"
            options={{
                false: "Not Within",
                ...mapToObj(filteredFeatures, (feature: any) => [
                    feature.properties.name,
                    feature.properties.name,
                ]),
            }}
            value={data.location ? data.location.properties.name : "false"}
            onValueChange={(value) => {
                if (value === "false") {
                    data.location = false;
                } else {
                    data.location = filteredFeatures.find(
                        (feature: any) => feature.properties.name === value,
                    );
                }

                questionModified();
            }}
            disabled={disabled}
        />
    );
};
