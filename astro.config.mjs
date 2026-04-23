// @ts-check
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";
import fs from "fs";
import path from "path";

// https://astro.build/config
export default defineConfig({
    integrations: [
        react(),
        tailwind({
            applyBaseStyles: false,
        }),
        partytown({
            config: {
                forward: ["dataLayer.push"],
            },
        }),
        AstroPWA({
            manifest: {
                name: "Jet Lag Hide and Seek Map Generator",
                short_name: "Map Generator",
                description:
                    "Automatically generate maps for Jet Lag The Game: Hide and Seek with ease! Simply name the questions and watch the map eliminate hundreds of possibilities in seconds.",
                icons: [
                    {
                        src: "https://sebzdead.github.io/JetLagHideAndSeek/JLIcon.png",
                        sizes: "1080x1080",
                        type: "image/png",
                    },
                    {
                        src: "https://sebzdead.github.io/JetLagHideAndSeek/android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "https://sebzdead.github.io/JetLagHideAndSeek/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
                theme_color: "#1F2F3F",
            },
        }),
    ],
    vite: {
        plugins: [
            {
                name: "dev-save-curated",
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.method === "POST" && req.url && req.url.includes("/api/save-curated")) {
                            let body = "";
                            req.on("data", (chunk) => {
                                body += chunk.toString();
                            });
                            req.on("end", () => {
                                try {
                                    const { filename, geojson } = JSON.parse(body);
                                    if (!filename || !geojson) {
                                        res.statusCode = 400;
                                        res.end(JSON.stringify({ error: "Missing data" }));
                                        return;
                                    }
                                    const outDir = path.join(process.cwd(), "public", "data");
                                    if (!fs.existsSync(outDir)) {
                                        fs.mkdirSync(outDir, { recursive: true });
                                    }
                                    fs.writeFileSync(path.join(outDir, filename), JSON.stringify(geojson, null, 2));
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.end(JSON.stringify({ success: true }));
                                } catch (e) {
                                    res.statusCode = 500;
                                    res.setHeader("Content-Type", "application/json");
                                    // @ts-ignore
                                    res.end(JSON.stringify({ error: e.message }));
                                }
                            });
                            return;
                        }
                        next();
                    });
                },
            },
        ],
    },
    devToolbar: {
        enabled: false,
    },
    site: "https://sebzdead.github.io",
    base: "JetLagHideAndSeek",
});
