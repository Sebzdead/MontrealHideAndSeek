import "leaflet-draw/dist/leaflet.draw.css";

import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import type {
    FeatureCollection,
    MultiPolygon,
    Polygon as GeoJSONPolygon,
} from "geojson";
import * as L from "leaflet";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { FeatureGroup, Marker } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import {
  autoSave,
  drawingQuestionKey,
  mapGeoJSON,
  polyGeoJSON,
  questionModified,
  questions,
  save,
} from "@/lib/context";
import { CacheType, clearCache } from "@/maps/api";
import { lngLatToText } from "@/maps/geo-utils";
import type {
  CustomTentacleQuestion,
  Question,
} from "@/maps/schema";

import { LatitudeLongitude } from "./LatLngPicker";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./ui/sidebar-l";

const TentacleMarker = ({
    point,
}: {
    point: CustomTentacleQuestion["places"][number];
}) => {
    const $autoSave = useStore(autoSave);
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Marker
                // @ts-expect-error This is passed to options, so it is not typed
                properties={point.properties}
                position={[
                    point.geometry.coordinates[1],
                    point.geometry.coordinates[0],
                ]}
                eventHandlers={{
                    click: () => {
                        setOpen(true);
                    },
                }}
            />
            <DialogContent>
                <div className="flex flex-col gap-2">
                    <Input
                        className="text-center !text-2xl font-bold font-poppins mt-3"
                        value={point.properties?.name}
                        onChange={(e) => {
                            point.properties.name = e.target.value;
                            questionModified();
                        }}
                    />
                    <SidebarMenu>
                        <LatitudeLongitude
                            latitude={point.geometry.coordinates[1]}
                            longitude={point.geometry.coordinates[0]}
                            inlineEdit
                            onChange={(lat, lng) => {
                                if (lat) {
                                    point.geometry.coordinates[1] = lat;
                                }
                                if (lng) {
                                    point.geometry.coordinates[0] = lng;
                                }

                                questionModified();
                            }}
                        />
                        {!$autoSave && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-blue-600 p-2 rounded-md font-semibold font-poppins transition-shadow duration-500 mt-2"
                                    onClick={save}
                                >
                                    Save
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export const PolygonDraw = () => {
    const $drawingQuestionKey = useStore(drawingQuestionKey);
    const $questions = useStore(questions);

    const featureRef = useRef<any | null>(null);

    let question: Question | undefined;

    if ($drawingQuestionKey === -1) {
        L.drawLocal.draw.toolbar.buttons.polygon = "Draw the hiding zone!";
    } else {
        question = $questions.find((q) => q.key === $drawingQuestionKey);

        if (question?.data.drag === false) {
            drawingQuestionKey.set(-1);
        }
    if (question?.id === "matching") {
      L.drawLocal.draw.toolbar.buttons.polygon =
        "Draw the matching zone(s)!";
    }
  }

    const onChange = () => {
        if (drawingQuestionKey.get() === -1) {
            if (!featureRef.current?._layers) return;

            const layers = featureRef.current._layers;
            const geoJSONs = Object.values(layers).map((layer: any) =>
                layer.toGeoJSON(),
            );
            const geoJSON = turf.featureCollection(
                geoJSONs,
            ) as FeatureCollection<GeoJSONPolygon | MultiPolygon>;

            mapGeoJSON.set(geoJSON);
            polyGeoJSON.set(geoJSON);
            questions.set([]);
            clearCache(CacheType.ZONE_CACHE);
        } else if (
            question?.id === "tentacles" &&
            question.data.locationType === "custom"
        ) {
            if (!featureRef.current?._layers) return;

            const layers = featureRef.current._layers;
            const geoJSONs = Object.values(layers).map((layer: any) => {
                const geoJSON = layer.toGeoJSON();
                geoJSON.properties = layer.options.properties;

                if (!geoJSON.properties) {
                    geoJSON.properties = {
                        name: lngLatToText(geoJSON.geometry.coordinates),
                    };
                }

                return geoJSON;
            });
            const geoJSON = turf.featureCollection(geoJSONs);

            question.data.places = _.uniqBy(
                geoJSON.features as CustomTentacleQuestion["places"],
                (x) => x.geometry.coordinates.join(","),
            ); // Sometimes keys are duplicated
            if (featureRef.current) {
                Object.values(featureRef.current._layers).map((layer: any) => {
                    if (!layer.options.properties) {
                        featureRef.current.removeLayer(layer);
                    }
                });
            }
      questionModified();
    }
  };

    useEffect(() => {
        if (featureRef.current && $drawingQuestionKey === -1) {
            featureRef.current.clearLayers();
        }
    }, [$drawingQuestionKey]);

    return (
        <FeatureGroup ref={featureRef}>
      {question &&
        question.id === "tentacles" &&
        question.data.locationType === "custom" &&
        question.data.places.map((x) => (
          <TentacleMarker
            key={x.geometry.coordinates.join(",")}
            point={x}
          />
        ))}
      <EditControl
                position="bottomleft"
                draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
        marker:
          question?.id === "tentacles"
            ? true
            : false,
        polyline: false,
        polygon:
          question?.id === "tentacles"
            ? false
            : {
                                  shapeOptions: { fillOpacity: 0 },
                              },
                }}
                onCreated={onChange}
                onEdited={onChange}
                onDeleted={onChange}
            />
        </FeatureGroup>
    );
};
