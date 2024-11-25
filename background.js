// Debugger variables
let targetTabId;
const inactivityThreshold = 30 * 1000; // 30 Seconds inactivity timeout threshold
let lastCaptureTime = Date.now(); // Track the last capture time

// Object to track saved files and their timestamps
const savedFiles = {};
const saveThreshold = 5 * 1000; // 5 seconds threshold

let extensionEnabled = false; // Toggle state of the extension

// Object to track response chunks by requestId
let responseChunks = {};

// Handle toggle messages from the popup
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "enableExtension") {
        extensionEnabled = true;
        console.log("Extension enabled");
    }

    if (message.action === "disableExtension") {
        extensionEnabled = false;
        console.log("Extension disabled");

        if (targetTabId) {
            chrome.debugger.detach({ tabId: targetTabId }, () => {
                console.log("Debugger detached as part of disabling the extension");
            });
        }
    }
});

// Attach debugger to the tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!extensionEnabled) return;

    if (tab.url?.includes("aidungeon.com") && changeInfo.status === "complete") {
        if (targetTabId && targetTabId !== tabId) {
            chrome.debugger.detach({ tabId: targetTabId }, () => {
                console.log("Debugger detached from previous tab");
            });
        }

        targetTabId = tabId;

        chrome.debugger.attach({ tabId: targetTabId }, "1.3", () => {
            console.log("Debugger attached");

            chrome.debugger.sendCommand({ tabId: targetTabId }, "Network.enable", {}, () => {
                console.log("Network debugging enabled");
            });
        });
    }
});

// Listen for network events using a combination of responseReceived, dataReceived, and loadingFinished
chrome.debugger.onEvent.addListener((source, method, params) => {
    if (!extensionEnabled) return;

    if (method === "Network.responseReceived") {
        const { requestId, response } = params;
        if (response.url.includes("graphql")) { // Filter for GraphQL responses
            responseChunks[requestId] = [];
        }
    }

    if (method === "Network.dataReceived") {
        const chunk = responseChunks[params.requestId];
        if (chunk) {
            chunk.push(params.dataLength); // Add chunk size to the buffer
        }
    }

    if (method === "Network.loadingFinished") {
        const chunks = responseChunks[params.requestId];
        if (chunks) {
            handleLargeResponse(source.tabId, params.requestId);
            delete responseChunks[params.requestId];
        }
    }
});

// Function to handle potentially large responses
function handleLargeResponse(tabId, requestId) {
    chrome.debugger.sendCommand(
        { tabId },
        "Network.getResponseBody",
        { requestId },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("Failed to get response body:", chrome.runtime.lastError);
                return;
            }

            if (response?.body) {
                try {
                    // Parse the JSON response
                    if (isJSON(response.body)) {
                        const body = JSON.parse(response.body);

                        // Filter and save only the required responses
                        if (body?.data?.scenario) {
                            console.log("Captured Scenario Response:", body);
                            saveResponseToFile(body, "scenario");
                        } else if (body?.data?.adventure) {
                            console.log("Captured Adventure Response:", body);
                            saveResponseToFile(body, "adventure");
                        } else {
                            console.log("Ignored response:", body);
                        }
                    } else {
                        console.warn("Response body is not valid JSON:", response.body);
                    }
                } catch (error) {
                    console.error("Error processing response body:", error);
                }
            } else {
                console.warn("Response body not available or too large to capture.");
            }
        }
    );
}

// Helper function to check if a string is valid JSON
function isJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// Function to save the response JSON to a file
function saveResponseToFile(response, type) {
    try {
        const jsonContent = JSON.stringify(response, null, 2);
        const title = type === "scenario" 
            ? response.data.scenario.title 
            : response.data.adventure.title;

        const sanitizedTitle = title.replace(/[\/:*?"<>|]/g, "_");

        if (savedFiles[sanitizedTitle]) {
            // Skip saving if the file has already been saved recently
            return;
        }

        chrome.downloads.download({
            url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
            filename: `${sanitizedTitle}.json`,
            saveAs: false,
        });

        savedFiles[sanitizedTitle] = Date.now(); // Track the saved file
        console.log(`Response saved as: ${sanitizedTitle}.json`);

        // Reset the last capture time to avoid unnecessary timeouts
        lastCaptureTime = Date.now();

        // Disable the extension and detach debugger after saving
        extensionEnabled = false;
        if (targetTabId) {
            chrome.debugger.detach({ tabId: targetTabId }, () => {
                console.log("Debugger detached after saving the file.");
            });
        }
    } catch (error) {
        console.error("Error saving response to file:", error);
    }
}


// Fallback: Disable the debugger if inactive for the threshold period
setInterval(() => {
    if (!extensionEnabled) return;

    const currentTime = Date.now();
    if (currentTime - lastCaptureTime > inactivityThreshold && targetTabId) {
        chrome.debugger.detach({ tabId: targetTabId }, () => {
            console.log("Debugger detached due to inactivity");
        });
    }
}, inactivityThreshold);

// Detach debugger on extension unload
chrome.runtime.onSuspend.addListener(() => {
    if (targetTabId) {
        chrome.debugger.detach({ tabId: targetTabId }, () => {
            console.log("Debugger detached on extension unload");
        });
    }
});
