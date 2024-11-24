// Initialize a Set to store unique document IDs (to prevent duplicates)
// const capturedRequestIds = new Set();

// Debugger variables
let targetTabId;
const inactivityThreshold = 1*60*1000; // 3 minutes
let lastCaptureTime = Date.now(); // Track the last capture time
// const processedRequestIds = new Set();


// Object to track saved files and their timestamps
const savedFiles = {};
const saveThreshold = 5* 1000; // 5 seconds threshold

let extensionEnabled = false; // Toggle state of the extension

// Handle toggle messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "enableExtension") {
    extensionEnabled = true;
    console.log("Extension enabled");
  }

  if (message.action === "disableExtension") {
    extensionEnabled = false;
    console.log("Extension disabled");

    // Detach the debugger and stop all operations
    if (targetTabId) {
      chrome.debugger.detach({ tabId: targetTabId }, () => {
        console.log("Debugger detached as part of disabling the extension");
      });
    }
  }
});

// Attach debugger to the tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!extensionEnabled) return; // Skip if the extension is disabled

  if (tab.url && tab.url.includes("aidungeon.com") && changeInfo.status === "complete") {
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

// Listen for network events and filter responses
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (!extensionEnabled) return; // Skip if the extension is disabled

  // Handle the "Network.responseReceived" event
  if (method === "Network.responseReceived") {
    chrome.debugger.sendCommand(
      { tabId: source.tabId },
      "Network.getResponseBody",
      { requestId: params.requestId },
      (response) => {
        if (chrome.runtime.lastError) return; // Ignore errors
        try {
          if (response && response.body) {
            const body = JSON.parse(response.body);

            if (body.data) {
              if (body.data.scenario) {
                saveResponseToFile(body, "scenario");
              } else if (body.data.adventure) {
                saveResponseToFile(body, "adventure");
              }
            }
          }
        } catch (error) {
          console.error("Error handling response body:", error);
        }
      }
    );
  }
});

// Function to save the response JSON to a file
function saveResponseToFile(response, type) {
  try {
    const jsonContent = JSON.stringify(response, null, 2);

    // Extract the title from the response based on the type (scenario or adventure)
    let title = "";
    if (type === "scenario") {
      title = response.data.scenario.title;
    } else if (type === "adventure") {
      title = response.data.adventure.title;
    }

    // Sanitize the title to ensure it's a valid filename
    const sanitizedTitle = title.replace(/[\/:*?"<>|]/g, "_");

    // Check if the file has already been saved recently (within threshold)
    const currentTimestamp = Date.now();
    if (savedFiles[sanitizedTitle]) {
      const lastSavedTimestamp = savedFiles[sanitizedTitle];
      if (currentTimestamp - lastSavedTimestamp < saveThreshold) {
        console.log(`File ${sanitizedTitle}.json already saved recently. Skipping save.`);
        return;
      }
    }

    // Save the file with the scenario or adventure title as the filename
    chrome.downloads.download({
      url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
      filename: `${sanitizedTitle}.json`,
      saveAs: false,
    });

    // Update the savedFiles object with the new timestamp
    savedFiles[sanitizedTitle] = currentTimestamp;

    console.log("Response saved to file with title:", sanitizedTitle);
  } catch (error) {
    console.error("Error saving response to file:", error);
  }
}

// Fallback: Disable the debugger if nothing is captured in the last 3 minutes
setInterval(() => {
  if (!extensionEnabled) return; // Skip if the extension is disabled

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
