// check_local_api.js

// 🛑 DELETE the original require line:
// const fetch = require('node-fetch');

const API_URL = "http://cmsai:8000/generate/"; //
const TIMEOUT_MS = 10000; // 10 seconds timeout

async function checkLocalApi() {
    const { default: fetch } = await import('node-fetch'); 
    console.log(`Attempting to connect to: ${API_URL}`);
    
    // Test payload for a harmless, safe prompt
    //const payload = { prompt: "I am having a nice day. Just wanted to share." };

    //const payload = { prompt: "I am struggling with anxiety but I have a great support network. Just sharing to feel less alone." };
    const payload = { prompt: "Everyone who disagrees with me is an idiot and should be banned from the internet!" };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const resp = await fetch(API_URL, {
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload), 
            signal: controller.signal 
        });

        clearTimeout(timeout); 

        const rawText = await resp.text(); 
        let data;

        if (resp.ok) { 
            try {
                data = JSON.parse(rawText); 
                
                // ⭐️ FIX: Validate the expected STRING/ARRAY types from the API ⭐️
                const hasSafetyString = typeof data.safety === 'string';
                const hasCategoriesArray = Array.isArray(data.categories);

                if (data && hasSafetyString && hasCategoriesArray) {
                    
                    // --- Conversion for Display ---
                    // Convert the API's 'Safe' string to a boolean for comparison
                    const isSafeBoolean = data.safety.toLowerCase() === 'safe';
                    // Convert the array to a readable string
                    const categoriesString = data.categories.join(', ');

                    console.log("✅ Connection SUCCESSFUL and JSON is Valid!");
                    console.log(`   HTTP Status: ${resp.status}`);
                    console.log(`   Safety Status (API String): "${data.safety}" (Converted to: ${isSafeBoolean})`);
                    console.log(`   Categories (API Array): [${categoriesString}]`);
                    return;

                } else {
                    console.error("❌ ERROR: JSON Structure Invalid.");
                    console.error("   Response must contain string 'safety' and array 'categories'.");
                    console.error("   Raw Data:", data);
                    return;
                }
                
            } catch (err) {
                console.error("❌ ERROR: Failed to parse JSON response."); 
                console.error("   Raw Response (first 500 chars):", rawText.slice(0, 500));
                return;
            }
        } else {
            console.error(`❌ ERROR: Server returned non-successful status code ${resp.status}`);
            console.error("   Raw Response:", rawText);
        }

    } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
            console.error("❌ ERROR: Request timed out after 10 seconds. Check API server status."); 
        } else {
            console.error("❌ CRITICAL ERROR: Network or connection failed."); 
            console.error("   Details:", err.message);
        }
    }
}

checkLocalApi();