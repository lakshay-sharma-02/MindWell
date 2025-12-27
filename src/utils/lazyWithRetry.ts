import { lazy, ComponentType } from "react";

/**
 * A wrapper around React.lazy that attempts to refresh the page
 * if a dynamic import fails (usually due to deployment updates invalidating old chunks).
 */
export const lazyWithRetry = (
    componentImport: () => Promise<{ default: ComponentType<any> }>
) => {
    return lazy(async () => {
        try {
            return await componentImport();
        } catch (error: any) {
            // Check if the error is related to loading a chunk
            const isChunkError =
                error?.message?.includes("Failed to fetch dynamically imported module") ||
                error?.message?.includes("Importing a module script failed") ||
                error?.name === "ChunkLoadError";

            if (isChunkError) {
                // Prevent infinite reload loops
                const storageKey = "chunk_load_error_reload";
                const hasReloaded = sessionStorage.getItem(storageKey);

                if (!hasReloaded) {
                    console.log("Chunk load failed, forcing reload to get new version...");
                    sessionStorage.setItem(storageKey, "true");
                    window.location.reload();
                    // Return a never-resolving promise to wait for reload
                    return new Promise(() => { });
                } else {
                    // If we already reloaded and still fail, clear flag and let it error
                    // (The ErrorBoundary should catch this)
                    console.error("Reloaded but still failed to load chunk.");
                    sessionStorage.removeItem(storageKey);
                    throw error;
                }
            }

            throw error;
        }
    });
};
