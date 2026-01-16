// util/moderation.js
const { default: fetch } = require("node-fetch"); // Use node-fetch for server-side fetch

// --- Configuration ---
const MODERATION_API_URL = "http://cmsai:8000/generate/";
const TIMEOUT_MS = 30000; 

// --- Moderation Function ---

/**
 * Checks if a given text content is safe using the local LLM moderation API.
 * @param {string} content - The text content of the post or reply.
 * @returns {Promise<{isSafe: boolean, reasoning: string, harmCategory: string | null}>} 
 * A promise that resolves to the structured moderation result.
 */
async function isContentSafe(content) {
    if (!content || content.trim().length === 0) {
        return {
            isSafe: false,
            reasoning: "Content is empty.",
            harmCategory: "OFF_TOPIC_SPAM",
        };
    }

    // The payload uses the 'prompt' field for the content [cite: 15]
    const payload = { prompt: content };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const resp = await fetch(MODERATION_API_URL, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload), 
            signal: controller.signal 
        });

        clearTimeout(timeout); 

        const rawText = await resp.text();
        let data;

        try {
            data = JSON.parse(rawText); 
        } catch (err) {
            console.error("Failed to parse JSON from server response. Raw response:"); 
            console.error(rawText.slice(0, 2000)); 
            // If we can't parse it, treat it as a critical failure.
            throw new Error("Invalid JSON response from moderation API.");
        }

        if (resp.ok) { // Server returned 200 OK
            // The API returns 'safety' (a string) and 'categories' (an array of strings)

            // ⭐️ FIX 1: Convert string 'safety' to boolean 'isSafe' ⭐️
            // Assuming "Safe" is the only value for safe content.
            const apiSafetyString = data.safety ? data.safety.toLowerCase() : '';
            const isSafe = apiSafetyString === 'safe';

            // ⭐️ FIX 2: Convert categories array to a single string ⭐️
            // If the content is flagged, use the first category found, otherwise use 'NONE'.
            let primaryHarmCategory = "NONE";
            if (!isSafe && Array.isArray(data.categories) && data.categories.length > 0) {
                // Use the first category and convert it to uppercase/snake_case for your schema
                primaryHarmCategory = data.categories[0].toUpperCase().replace(/\s/g, '_');
            }

            return {
                isSafe: isSafe,
                reasoning: isSafe ? "Content passed local moderation." : "Content flagged by LLM.",
                harmCategory: primaryHarmCategory,
            };
        } else {
            // Server returned a non-200 status code [cite: 43]
            console.error("Server returned error:", JSON.stringify(data, null, 2));
            return {
                isSafe: false,
                reasoning: `API request failed with status ${resp.status}`,
                harmCategory: "DANGEROUS_CONTENT", // Fallback to block content on API error
            };
        }

    } catch (err) {
        clearTimeout(timeout); // Ensure timeout is cleared on early errors
        if (err.name === "AbortError") {
            console.error("Request timed out");
        } else {
            console.error("Network or runtime error:", err);
        }

        // Fail-safe: Block the content if the API is unreachable or times out
        return {
            isSafe: false,
            reasoning: "Moderation API failure or timeout. Blocked for safety.",
            harmCategory: "DANGEROUS_CONTENT",
        };
    }
}

module.exports = { isContentSafe };

// Note: You must install node-fetch for this to work in Node.js CommonJS environment:
// npm install node-fetch or npm install node-fetch@2