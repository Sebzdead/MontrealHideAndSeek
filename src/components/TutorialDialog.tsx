import { useStore } from "@nanostores/react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import {
    AlertDialog,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarMenu } from "@/components/ui/sidebar-l";
import { showTutorial, tutorialStep } from "@/lib/context";
import { cn } from "@/lib/utils";

import {
  MatchingQuestionComponent,
  RadiusQuestionComponent,
  TentacleQuestionComponent,
  ThermometerQuestionComponent,
} from "./QuestionCards";

interface TutorialStep {
    title: string;
    content: ReactNode;
    targetSelector?: string; // CSS selector for the element to highlight
    position?: "top" | "bottom" | "center"; // Where to position the dialog relative to target
    isDescription?: boolean;
}

const tutorialSteps: TutorialStep[] = [
    {
        title: "Welcome to the Montreal Hide and Seek Map Generator!",
        content: (
            <>
                Welcome to the Hide and Seek map generator, custom-built for
                the Island of Montreal! This tutorial will walk you through
                every feature and question type available in this tool.
                <br />
                <br />
                This tool is designed for a custom Montreal version of the Jet
                Lag Hide and Seek Home Game. The map is pre-configured for the
                Island of Montreal with local landmarks, metro lines, and
                Montreal-specific data baked in.
                <br />
                <br />
                If you&apos;re already familiar with the basics, feel free to{" "}
                <strong>skip this tutorial by scrolling down</strong>. However,
                this guide covers advanced features you might not know about.
                To support this free tool, please consider{" "}
                <a
                    href="https://github.com/taibeled/JetLagHideAndSeek"
                    className="text-blue-500 cursor-pointer"
                    target="_blank"
                    rel="noreferrer"
                >
                    starring the repository on GitHub
                </a>{" "}
                or sharing it with fellow Jet Lag fans!
            </>
        ),
        position: "center",
    },
    {
        title: "Overview: Game Setup Process",
        content: (
            <>
                Here&apos;s the typical workflow for setting up a game on the
                Island of Montreal:
                <br />
                <br />
                <strong>1. Game Area:</strong> The Island of Montreal is
                pre-loaded as your play area. You can add or subtract regions
                as needed.
                <br />
                <br />
<strong>2. Question Creation:</strong> Add and configure the 4
        question types (Radius, Thermometer, Tentacles, Matching)
                <br />
                <br />
                <strong>3. Sharing:</strong> Share the questions and game
                boundaries with other players
                <br />
                <br />
                <strong>4. Hider Mode:</strong> Let the hider automatically
                answer questions based on their location
                <br />
                <br />
                <strong>5. Zone Analysis:</strong> View potential hiding zones
                and their constraints
                <br />
                <br />
                Let&apos;s explore each step in detail!
            </>
        ),
        position: "center",
    },
    {
        title: "Game Area: The Island of Montreal",
        content: (
            <>
                The map comes pre-loaded with the Island of Montreal as the
                default play area. Landmark pins for parks, hospitals,
                universities, and airports are already displayed on the map.
                <br />
                <br />
                <strong>Landmark Pins on the Map:</strong>
                <br />• <span style={{ color: "#008000" }}>Green pins</span>{" "}
                = Parks (Parcs)
                <br />• <span style={{ color: "#ff0000" }}>Red pins</span> =
                Hospitals (Hôpitaux)
                <br />•{" "}
                <span style={{ color: "#800080" }}>Purple pins</span> =
                Universities (Universités)
                <br />•{" "}
                <span style={{ color: "#000000" }}>Black pins</span> =
                Airports
                <br />
                <br />
Click any landmark pin to see its name and quickly add a
        matching question for that location!
            </>
        ),
        targetSelector: '[data-tutorial-id="place-picker"]',
        position: "bottom",
    },
    {
        title: "Location Management: Add, Subtract, Remove",
        content: (
            <>
                You can fine-tune the play area beyond the default Island of
                Montreal:
                <br />
                <br />
                <strong>Adding Locations (+ button):</strong> Expands your play
                area by including additional regions
                <br />
                <br />
                <strong>Subtracting Locations (- button):</strong> Creates
                &ldquo;holes&rdquo; in your play area by excluding specific
                regions. Perfect for removing water bodies, restricted areas,
                or creating complex boundaries.
                <br />
                <br />
                <strong>Removing Locations (X button):</strong> Completely
                removes the location from your game
                <br />
                <br />
                <strong>
                    &ldquo;Clear Questions &amp; Cache&rdquo; button:
                </strong>{" "}
                Resets all questions and clears cached data when changing
                locations significantly
            </>
        ),
        targetSelector: '[data-tutorial-id="place-picker-content"]',
        position: "bottom",
    },
    {
        title: "Advanced Location Setup: Custom Polygon Drawing",
        content: (
            <>
                For custom play areas, the Polygon Tool allows you to draw:
                <br />
                <br />
                <strong>Polygon Tool:</strong> Draw custom boundaries that
                perfectly match your intended play area. Great for irregular
                shapes or when preset locations don&apos;t quite fit your
                needs.
                <br />
                <br />
                <strong>Drawing Tips:</strong>
                <br />• Click to start, continue clicking to add points
                <br />• Click the first point again to close the polygon
                <br />• Use multiple polygons to create complex areas
                <br />
                <br />
                <strong>Use Cases:</strong> University campuses, specific
                neighborhoods, custom game boundaries, or areas that cross
                multiple administrative regions.
            </>
        ),
        targetSelector: ".leaflet-draw-draw-polygon",
        position: "top",
    },
    {
        title: "Opening the Question Sidebar",
        content: (
            <>
                Adding questions can be done in two ways: through the sidebar,
                or directly on the map. To open the sidebar, click the
                highlighted button. To add a question on the map, right-click
                on desktop or long-press on mobile. A question will be added
                at the clicked location, and you can then select the question
                type.
                <br />
                <br />
<strong>Landmark Shortcut:</strong> Click any landmark pin on
        the map and use the popup menu to instantly add a matching
        question pre-configured for that location.
            </>
        ),
        targetSelector: '[data-tutorial-id="left-sidebar-trigger"]',
        position: "bottom",
    },
    {
        title: "Question Creation Interface (Part 1)",
        content: (
            <>
                This sidebar is your question command center. Each button
                creates a different question type. Proceed to the next step to
                learn about each question type in detail.
            </>
        ),
        targetSelector: '[data-tutorial-id="add-questions-buttons"]',
        position: "top",
    },
    {
        title: "Question Creation Interface (Part 2)",
        content: (
            <>
                Here are the four question types available:
                <br />
                <br />
                <strong>1. RADIUS:</strong> &ldquo;Is the hider within X
                distance of this point?&rdquo;
                <br />
                <br />
                <strong>2. THERMOMETER:</strong> &ldquo;Is the hider closer to
                point A or point B?&rdquo;
                <br />
                <br />
                <strong>3. TENTACLES:</strong> &ldquo;What specific location
                within X distance of the seekers is the hider closest
                to?&rdquo; (McDonald&apos;s or Libraries)
                <br />
                <br />
<strong>4. MATCHING:</strong> &ldquo;Does the hider share the
        same property as this reference point?&rdquo; (District,
        Airport, Metro Line, Park, Hospital, University)
        <br />
        <br />
        <strong>&ldquo;Paste Question&rdquo;:</strong> Import
                questions from clipboard (JSON format)
            </>
        ),
        position: "center",
    },
    {
        title: "Radius Questions: The Foundation",
        content: (
            <>
                Radius questions are the simplest question type. Here&apos;s a
                sample question interface:
                <br />
                <br />
                <SidebarGroup className="text-foreground">
                    <SidebarMenu>
                        <RadiusQuestionComponent
                            questionKey={Math.random()}
                            data={{
                                collapsed: false,
                                drag: true,
                                lat: 45.5017,
                                lng: -73.5673,
                                radius: 5,
                                unit: "kilometers",
                                color: "blue",
                                within: false,
                            }}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <br />
                <strong>Radius Control:</strong> Set any distance (supports
                decimals)
                <br />
                <br />
                <strong>Units:</strong> Miles, kilometers, or meters
                <br />
                <br />
                <strong>Position:</strong> Drag the marker on the map or input
                exact coordinates. Alternatively, you can use your current
                location or paste a location
                <br />
                <br />
                <strong>Inside/Outside:</strong> Toggle whether the hider is
                within or outside the radius
                <br />
                <br />
                <strong>Lock/Unlock:</strong> Prevents accidental modifications
                when locked
            </>
        ),
        isDescription: false,
        position: "center",
    },
    {
        title: "Thermometer Questions: Relative Positioning",
        content: (
            <>
                Thermometer questions partition the map into two regions, both
                containing all points that are closer to either the start or
                end:
                <br />
                <br />
                <SidebarGroup className="text-foreground">
                    <SidebarMenu>
                        <ThermometerQuestionComponent
                            questionKey={Math.random()}
                            data={{
                                collapsed: false,
                                drag: true,
                                latA: 45.5017,
                                lngA: -73.5673,
                                latB: 45.5132,
                                lngB: -73.5582,
                                colorA: "red",
                                colorB: "blue",
                                warmer: false,
                            }}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <br />
                <strong>Two-Point System:</strong> Point A (the start point)
                and Point B (the end point), each with independent coordinates
                and colors
                <br />
                <br />
                <strong>&ldquo;Warmer&rdquo; Logic:</strong>
                <br />• Warmer = Hider is closer to Point B (the end point)
                <br />• Colder = Hider is closer to Point A (the start point)
                <br />
                <br />
                <strong>Coordinate Input:</strong> Set precise locations or
                drag markers visually
                <br />
                <br />
                <strong>Color Coding:</strong> Different colors help
                distinguish between points on the map
            </>
        ),
        position: "center",
    },
    {
        title: "Tentacles Questions: Location Discovery",
        content: (
            <>
                Tentacles questions identify specific locations within a radius.
                On the Island of Montreal, two location types are available:
                <br />
                <br />
                <SidebarGroup className="text-foreground">
                    <SidebarMenu>
                        <TentacleQuestionComponent
                            questionKey={Math.random()}
                            data={{
                                collapsed: false,
                                drag: true,
                                lat: 45.5017,
                                lng: -73.5673,
                                radius: 1,
                                unit: "kilometers",
                                color: "red",
                                locationType: "mcdonalds",
                                location: false,
                                isInsideCircle: true,
                            }}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <br />
                <strong>Location Types:</strong>
                <br />• <strong>McDonald&apos;s:</strong> Find the nearest
                McDonald&apos;s within the radius
                <br />• <strong>Libraries:</strong> Find the nearest library
                within the radius
                <br />
                <br />
                <strong>Radius Control:</strong> Adjusts the search area for
                finding locations
                <br />
                <br />
                <strong>Hider Position:</strong> Toggle whether the hider is
                inside or outside the radius. When inside, you can select which
                specific location the hider is at.
            </>
        ),
        position: "center",
    },
    {
        title: "Matching Questions: Property Comparison (Part 1)",
        content: (
            <>
                Matching questions compare properties between the hider&apos;s
                location and a reference point. Six matching types are
                available for Montreal:
                <br />
                <br />
                <SidebarGroup className="text-foreground">
                    <SidebarMenu>
                        <MatchingQuestionComponent
                            questionKey={Math.random()}
                            data={{
                                collapsed: false,
                                drag: true,
                                lat: 45.5017,
                                lng: -73.5673,
                                color: "blue",
                                same: true,
                                type: "metro-line",
                                metroLine: "green",
                            }}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <br />
                <strong>District Matching:</strong>
                <br />• Determines which Montreal borough/district the
                reference point falls in
                <br />• &ldquo;Same&rdquo; keeps only that district;
                &ldquo;Different&rdquo; excludes it
                <br />
                <br />
                <strong>Airport Matching:</strong>
                <br />• Compares nearest commercial airport (Trudeau vs
                Metropolitan)
                <br />• Automatically determines which is closer
                <br />
                <br />
                <strong>Metro Line Matching:</strong>
                <br />• Select a metro line: Green, Orange, Yellow, Blue, or
                REM
                <br />• &ldquo;Same&rdquo; excludes territory around stations
                on other lines
                <br />• &ldquo;Different&rdquo; excludes territory around
                stations on the selected line
            </>
        ),
        position: "center",
    },
    {
        title: "Matching Questions: Property Comparison (Part 2)",
        content: (
            <>
                <strong>Park, Hospital, and University Matching:</strong>
                <br />
                <br />
                These use Voronoi diagrams to determine which
                landmark&apos;s territory the hider is in:
                <br />
                <br />
                <strong>Location Dropdown:</strong> When you select Park,
                Hospital, or University as the matching type, a dropdown
                appears listing all known locations of that type on the Island
                of Montreal. Select a specific location to target its Voronoi
                cell directly.
                <br />
                <br />
                <strong>Voronoi Logic:</strong>
                <br />• The Island of Montreal&apos;s landmarks are divided
                into Voronoi cells — each cell represents the area closest to
                that landmark
                <br />• &ldquo;Same&rdquo; keeps only the selected
                landmark&apos;s cell; all other cells are excluded
                <br />• &ldquo;Different&rdquo; excludes the selected
                landmark&apos;s cell; all other cells remain
                <br />
                <br />
                <strong>Quick Add from Map:</strong> Click any landmark pin on
                the map and select &ldquo;Add Matching&rdquo; to
                automatically create a matching question with the type and
                location pre-filled!
                <br />
                <br />
                <strong>Default (Map Pin):</strong> If no specific location is
                selected, the map pin&apos;s position determines which Voronoi
                cell is used.
            </>
        ),
        position: "center",
    },
{
        title: "Sharing and Collaboration Features",
        content: (
            <>
                Seamless sharing is crucial for multiplayer games. The sharing
                system offers multiple methods:
                <br />
                <br />
                <strong>URL Sharing:</strong>
                <br />• <strong>Direct Links:</strong> Embed entire game state
                in URL
                <br />• <strong>Compressed Links:</strong> Smaller URLs for
                complex games
                <br />• <strong>Pastebin Integration:</strong> For very large
                game states
                <br />
                <br />
                <strong>What Gets Shared:</strong>
                <br />• All location boundaries (preset and custom)
                <br />• Complete question configurations
                <br />• Question answers/results
                <br />• Game options and settings
                <br />• Visual customizations (colors, units)
                <br />
                <br />
                <strong>What Doesn&apos;t Get Shared:</strong>
                <br />• Hider&apos;s actual location (when using Hider Mode)
                <br />• Personal API keys
            </>
        ),
        targetSelector: '[data-tutorial-id="share-questions-button"]',
        position: "top",
    },
    {
        title: "Hider Mode: Automated Question Answering",
        content: (
            <>
                Hider Mode is the most powerful feature for streamlining
                gameplay:
                <br />
                <br />
                <strong>How It Works:</strong>
                <br />
                1. Hider receives game link from seekers
                <br />
                2. Enables Hider Mode and inputs their exact location
                <br />
                3. All questions are automatically answered based on their
                position
                <br />
                4. Hider shares the updated link with answers back to seekers
                <br />
                <br />
                <strong>Privacy:</strong> The hider&apos;s exact coordinates
                are never shared, only the question answers.
                <br />
                <br />
                <strong>Note:</strong> When Hider Mode is active, question
                result toggles (Same/Different, Inside/Outside, etc.) are
                locked to prevent manual overrides.
            </>
        ),
        position: "center",
    },
    {
        title: "Advanced Options and Settings",
        content: (
            <>
                The options menu contains powerful customization features:
                <br />
                <br />
                <strong>Display Options:</strong>
                <br />• <strong>Auto-zoom:</strong> Automatically fits map to
                relevant areas when adding questions or analyzing zones.
                <br />• <strong>Animate Map Movements:</strong> Smooth
                transitions between map positions vs instant jumps.
                <br />• <strong>Follow Me:</strong> GPS tracking for mobile
                use. Adds a marker that follows your location in real-time.
                <br />
                <br />
                <strong>Unit Preferences:</strong>
                <br />• <strong>Default Unit:</strong> Miles, kilometers, or
                meters for new questions. This becomes the default for all new
                questions.
                <br />
                <br />
                <strong>Automation:</strong>
                <br />• <strong>Auto-save:</strong> Continuous saving vs
                manual save control. When disabled, you&apos;ll see
                &ldquo;Save&rdquo; buttons appear on question cards for manual
                control.
                <br />
                <br />
                <strong>API Integration:</strong>
                <br />• <strong>Thunderforest API Key:</strong> Enhanced map
                tiles
                <br />• <strong>Pastebin API Key:</strong> Improved sharing
                for large games
            </>
        ),
        targetSelector: '[data-tutorial-id="option-questions-button"]',
        position: "top",
    },
    {
        title: "Data Sources and Accuracy",
        content: (
            <>
                Understanding the underlying data helps set appropriate
                expectations:
                <br />
                <br />
                <strong>Montreal-Specific Data:</strong>
                <br />• <strong>Landmarks:</strong> Parks, hospitals,
                universities, and airports are sourced from local Montreal
                geographic data
                <br />• <strong>Metro Lines:</strong> STM and REM station data
                with accurate line assignments (Green, Orange, Yellow, Blue,
                REM)
                <br />• <strong>Districts:</strong> Montreal borough
                boundaries for district matching
                <br />
                <br />
                <strong>OpenStreetMap (OSM) Foundation:</strong>
                <br />• McDonald&apos;s, libraries, and other POI data comes
                from OpenStreetMap
                <br />• Community-driven mapping with varying completeness
                <br />• Generally excellent in urban areas like Montreal
                <br />
                <br />
                <strong>Coordinate Accuracy:</strong>
                <br />• Distance calculations use geodesic formulas
                <br />• Typical accuracy within 1-2 meters for positioning
                <br />• Metro station exclusion zones use a 300m radius buffer
            </>
        ),
        position: "center",
    },
    {
        title: "You're Ready to Master Montreal Hide and Seek!",
        content: (
            <>
                Congratulations! You now have comprehensive knowledge of all
                features in this Montreal Hide and Seek map generator.
                <br />
                <br />
<strong>Quick Start Checklist:</strong>
          <br />✓ The Island of Montreal is pre-loaded as your play area
          <br />✓ Add and configure questions using the four main types
          <br />✓ Click landmark pins to quickly add matching
          questions
                <br />✓ Refresh the map after adding questions to verify the
                elimination area
                <br />✓ Share the game link with all players using the Share
                button
                <br />✓ Use Hider Mode for automatic question answering
                <br />
                <br />
<strong>Master the Four Question Types:</strong>
          <br />• <strong>Radius:</strong> Distance-based circles
          (inside/outside)
          <br />• <strong>Thermometer:</strong> Relative distance
          comparison (warmer/colder)
          <br />• <strong>Tentacles:</strong> Specific location
          identification (McDonald&apos;s or Libraries)
          <br />• <strong>Matching:</strong> Property comparison
          (District, Airport, Metro Line, Park, Hospital, University)
                <br />
                <br />
                <strong>Need Help?</strong> This tutorial is always available
                via the Tutorial button. Feel free to{" "}
                <a
                    href="https://github.com/taibeled/JetLagHideAndSeek/issues"
                    className="text-blue-500 cursor-pointer"
                    target="_blank"
                    rel="noreferrer"
                >
                    report issues or request features on GitHub
                </a>
                .
                <br />
                <br />
                Happy hiding and seeking on the Island of Montreal!
            </>
        ),
        position: "center",
    },
];

const TutorialOverlay = ({
    targetSelector,
    isVisible,
}: {
    targetSelector?: string;
    isVisible: boolean;
}) => {
    const [highlightedElement, setHighlightedElement] =
        useState<Element | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isVisible || !targetSelector) {
                setHighlightedElement(null);
                return;
            }

            setHighlightedElement(
                document.querySelector(targetSelector) || null,
            );
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [targetSelector, isVisible]);

    if (!isVisible) {
        return null;
    }

    const rect = highlightedElement?.getBoundingClientRect();
    const padding = 12;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {highlightedElement && rect ? (
                <div>
                    <div
                        className="absolute transition-all duration-500 ease-out tutorial-highlight-pulse"
                        style={{
                            left: rect.left - padding,
                            top: rect.top - padding,
                            width: rect.width + padding * 2,
                            height: rect.height + padding * 2,
                            boxShadow: `
                                    0 0 0 4px rgba(59, 130, 246, 0.8),
                                    0 0 0 8px rgba(59, 130, 246, 0.4),
                                    0 0 0 9999px rgba(0, 0, 0, 0.6),
                                    0 0 30px rgba(59, 130, 246, 0.6)
                                `,
                            borderRadius: "12px",
                            border: "3px solid rgb(59, 130, 246)",
                            background: "transparent",
                            zIndex: 10000,
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                            style={{
                                animation: "breathe 3s infinite ease-in-out",
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />
            )}
        </div>
    );
};

export const TutorialDialog = () => {
    const $showTutorial = useStore(showTutorial);
    const dialogRef = useRef<HTMLDivElement>(null);
    const $tutorialStep = useStore(tutorialStep);

    const handleNext = () => {
        if ($tutorialStep < tutorialSteps.length - 1) {
            tutorialStep.set($tutorialStep + 1);
        }
    };

    const handlePrevious = () => {
        if ($tutorialStep > 0) {
            tutorialStep.set($tutorialStep - 1);
        }
    };
    const handleClose = () => {
        showTutorial.set(false);
    };

    const currentTutorialStep = tutorialSteps[$tutorialStep];

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!$showTutorial || !dialogRef.current) return;

            const dialogElement = dialogRef.current;
            const isMobile = window.innerWidth < 768; // Tailwind md breakpoint
            const maxWidth = isMobile ? window.innerWidth - 40 : 680;

            dialogElement.style.maxWidth = `${maxWidth}px`;
            dialogElement.style.width = "auto";
            dialogElement.style.height = "auto";

            if (!currentTutorialStep.targetSelector) {
                dialogElement.style.position = "fixed";
                dialogElement.style.left = "50%";
                dialogElement.style.top = "50%";
                dialogElement.style.transform = "translate(-50%, -50%)";
                dialogElement.style.right = "auto";
                dialogElement.style.bottom = "auto";
                return;
            }

            const targetElement = document.querySelector(
                currentTutorialStep.targetSelector,
            ) as HTMLElement;

            if (!targetElement) {
                // If target element not found, center the dialog
                dialogElement.style.position = "fixed";
                dialogElement.style.left = "50%";
                dialogElement.style.top = "50%";
                dialogElement.style.transform = "translate(-50%, -50%)";
                dialogElement.style.right = "auto";
                dialogElement.style.bottom = "auto";
                return;
            }

            const rect = targetElement.getBoundingClientRect();
            const position = currentTutorialStep.position || "center";
            const padding = 20;

            // Ensure positioning is set but don't reset transform immediately
            dialogElement.style.position = "fixed";

            const dialogRect = dialogElement.getBoundingClientRect();
            const dialogWidth = Math.min(
                dialogRect.width || 680,
                isMobile ? window.innerWidth - padding * 2 : 680,
            );
            const dialogHeight = dialogRect.height || 400;

            let finalX = 0;
            let finalY = 0;

            // On mobile, use simpler positioning logic
            if (isMobile) {
                // On mobile, always center horizontally and position vertically based on target
                finalX = (window.innerWidth - dialogWidth) / 2;

                switch (position) {
                    case "top": {
                        finalY = Math.max(
                            padding,
                            rect.top - dialogHeight - padding,
                        );
                        // If no space above, move to below
                        if (finalY < padding) {
                            finalY = Math.min(
                                rect.bottom + padding,
                                window.innerHeight - dialogHeight - padding,
                            );
                        }
                        break;
                    }
                    case "bottom": {
                        finalY = Math.min(
                            rect.bottom + padding,
                            window.innerHeight - dialogHeight - padding,
                        );
                        // If no space below, move to above
                        if (
                            finalY + dialogHeight >
                            window.innerHeight - padding
                        ) {
                            finalY = Math.max(
                                padding,
                                rect.top - dialogHeight - padding,
                            );
                        }
                        break;
                    }
                    default:
                        // Center
                        finalY = (window.innerHeight - dialogHeight) / 2;
                        break;
                }

                // Ensure dialog stays within viewport bounds
                finalY = Math.max(
                    padding,
                    Math.min(
                        finalY,
                        window.innerHeight - dialogHeight - padding,
                    ),
                );
            } else {
                // Desktop positioning logic (unchanged)
                switch (position) {
                    case "top": {
                        finalX = Math.max(
                            padding,
                            Math.min(
                                window.innerWidth - dialogWidth - padding,
                                rect.left + rect.width / 2 - dialogWidth / 2,
                            ),
                        );
                        finalY = Math.max(
                            padding,
                            rect.top - dialogHeight - padding,
                        );
                        // If no space above, flip to below
                        if (finalY < padding) {
                            finalY = rect.bottom + padding;
                        }
                        break;
                    }
                    case "bottom": {
                        finalX = Math.max(
                            padding,
                            Math.min(
                                window.innerWidth - dialogWidth - padding,
                                rect.left + rect.width / 2 - dialogWidth / 2,
                            ),
                        );
                        finalY = rect.bottom + padding;
                        // If no space below, flip to above
                        if (
                            finalY + dialogHeight >
                            window.innerHeight - padding
                        ) {
                            finalY = Math.max(
                                padding,
                                rect.top - dialogHeight - padding,
                            );
                        }
                        break;
                    }
                    default:
                        // Center
                        dialogElement.style.left = "50%";
                        dialogElement.style.top = "50%";
                        dialogElement.style.transform = "translate(-50%, -50%)";
                        dialogElement.style.right = "auto";
                        dialogElement.style.bottom = "auto";
                        return;
                }
            }

            // Apply positioning smoothly
            dialogElement.style.transform = "none";
            dialogElement.style.left = `${finalX}px`;
            dialogElement.style.top = `${finalY}px`;
            dialogElement.style.right = "auto";
            dialogElement.style.bottom = "auto";
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [$tutorialStep, $showTutorial]);

    useEffect(() => {
        if (!$showTutorial) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    event.preventDefault();
                    handleNext();
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    event.preventDefault();
                    handlePrevious();
                    break;
                case "Escape":
                    event.preventDefault();
                    handleClose();
                    break;
                case "Enter":
                case " ":
                    event.preventDefault();
                    if ($tutorialStep === tutorialSteps.length - 1) {
                        handleClose();
                    } else {
                        handleNext();
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [$showTutorial, $tutorialStep]);

    return (
        <>
            <TutorialOverlay
                targetSelector={currentTutorialStep.targetSelector}
                isVisible={$showTutorial}
            />
            <AlertDialog open={$showTutorial} onOpenChange={showTutorial.set}>
                <AlertDialogPrimitive.AlertDialogContent
                    ref={dialogRef}
                    className={cn(
                        "fixed z-[10000] grid w-full gap-4 border bg-background p-4 md:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
                        "!max-h-[50vh] overflow-y-auto tutorial-dialog",
                        // Only apply default center positioning for non-targeted steps
                        !currentTutorialStep.targetSelector &&
                            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] !max-h-[90vh]",
                    )}
                    style={{
                        maxWidth: "min(680px, calc(100vw - 40px))",
                        width: "auto",
                        transition:
                            "left 0.3s ease-out, top 0.3s ease-out, transform 0.3s ease-out",
                    }}
                    data-tutorial-active={$showTutorial}
                >
                    <AlertDialogHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <AlertDialogTitle className="text-2xl font-bold text-left">
                                {currentTutorialStep.title}
                            </AlertDialogTitle>
                        </div>

                        <div className="flex space-x-2">
                            {tutorialSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full flex-1 ${
                                        index <= $tutorialStep
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </AlertDialogHeader>

                    {(currentTutorialStep.isDescription ?? true) ? (
                        <AlertDialogDescription className="text-base leading-relaxed whitespace-pre-line">
                            {currentTutorialStep.content}
                        </AlertDialogDescription>
                    ) : (
                        <div className="text-base leading-relaxed whitespace-pre-line text-muted-foreground">
                            {currentTutorialStep.content}
                        </div>
                    )}

                    <div className="flex flex-col gap-y-2 justify-between items-center pt-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="text-sm"
                            >
                                Skip Tutorial
                            </Button>
                            <div className="hidden md:block text-xs text-muted-foreground">
                                Use arrow keys to navigate
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {$tutorialStep + 1} of {tutorialSteps.length}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={$tutorialStep === 0}
                                className="flex items-center space-x-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span>Previous</span>
                            </Button>
                            {$tutorialStep === tutorialSteps.length - 1 ? (
                                <Button
                                    onClick={handleClose}
                                    variant="secondary"
                                >
                                    <span>Get Started!</span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="flex items-center space-x-1"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </AlertDialogPrimitive.AlertDialogContent>
            </AlertDialog>
        </>
    );
};
