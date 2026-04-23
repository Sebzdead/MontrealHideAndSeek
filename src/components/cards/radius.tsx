import { useStore } from "@nanostores/react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Label } from "@/components/ui/label";
import {
  SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  isLoading,
  questionModified,
  questions,
  triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { RadiusQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

export const RadiusQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: RadiusQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
  useStore(triggerLocalRefresh);
  const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const label = `Radius
    ${
        $questions
            .filter((q) => q.id === "radius")
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
            <SidebarMenuItem>
                <div className="flex flex-col gap-2 mt-2 px-1">
                    <Label
                        className={cn(
                            "font-semibold text-sm mt-1",
                            $isLoading && "text-muted-foreground",
                        )}
                    >
                        Radar Size:
                    </Label>
                    <ToggleGroup
                        className="grow flex-wrap justify-start"
                        type="single"
                        value={
                            data.radius === 200 ? "200m" :
                            data.radius === 500 ? "500m" :
                            data.radius === 1 ? "1km" :
                            data.radius === 3 ? "3km" :
                            data.radius === 5 ? "5km" : ""
                        }
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
                            } else if (value === "5km") {
                                dt = 5;
                                u = "kilometers";
                            }

                            data.radius = dt;
                            data.unit = u as any;
                            questionModified();
                        }}
                        disabled={!data.drag || $isLoading}
                    >
                        <ToggleGroupItem value="200m">200m</ToggleGroupItem>
                        <ToggleGroupItem value="500m">500m</ToggleGroupItem>
                        <ToggleGroupItem value="1km">1km</ToggleGroupItem>
                        <ToggleGroupItem value="3km">3km</ToggleGroupItem>
                        <ToggleGroupItem value="5km">5km</ToggleGroupItem>
                    </ToggleGroup>
                </div>
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
                    value={data.within ? "inside" : "outside"}
                    onValueChange={(value: "inside" | "outside") => {
                        if (!value) return;
                        questionModified((data.within = value === "inside"));
                    }}
                    disabled={!data.drag || $isLoading}
                >
                    <ToggleGroupItem value="outside">Outside</ToggleGroupItem>
                    <ToggleGroupItem value="inside">Inside</ToggleGroupItem>
                </ToggleGroup>
            </div>
        </QuestionCard>
    );
};
