import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Split heavy vendors into cached chunks so page chunks stay small
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        if (
                            id.includes("framer-motion") ||
                            id.includes("motion")
                        ) {
                            return "vendor-motion";
                        }
                        return "vendor";
                    }
                },
            },
        },
    },
});
