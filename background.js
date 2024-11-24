// Debugger variables
let targetTabId;
const inactivityThreshold = 3 * 60 * 1000; // 3 minutes
let lastCaptureTime = Date.now(); // Track the last capture time

// Object to track saved files and their timestamps
const savedFiles = {};
const saveThreshold = 5 * 1000; // 5 seconds threshold

let extensionEnabled = false; // Toggle state of the extension

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
			chrome.debugger.detach({
				tabId: targetTabId
			}, () => {
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
			chrome.debugger.detach({
				tabId: targetTabId
			}, () => {
				console.log("Debugger detached from previous tab");
			});
		}

		targetTabId = tabId;

		chrome.debugger.attach({
			tabId: targetTabId
		}, "1.3", () => {
			console.log("Debugger attached");

			chrome.debugger.sendCommand({
				tabId: targetTabId
			}, "Network.enable", {}, () => {
				console.log("Network debugging enabled");
			});
		});
	}
});

chrome.debugger.onEvent.addListener((source, method, params) => {
    if (!extensionEnabled) return;
  
    if (method === "Network.responseReceived") {
      chrome.debugger.sendCommand(
        { tabId: source.tabId },
        "Network.getResponseBody",
        { requestId: params.requestId },
        (response) => {
          if (chrome.runtime.lastError) return;
          try {
            if (response?.body) {
              // Check if the body is valid JSON
              if (isJSON(response.body)) {
                const body = JSON.parse(response.body);
  
                if (body.data?.scenario) {
                  saveResponseToFile(body, "scenario");
                } else if (body.data?.adventure) {
                  saveResponseToFile(body, "adventure");
                }
              } else {
                console.warn("Response body is not valid JSON, skipping:", response.body);
              }
            }
          } catch (error) {
            console.error("Error handling response body:", error);
          }
        }
      );
    }
  });
  
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
		const title = type === "scenario" ? response.data.scenario.title : response.data.adventure.title;

		const sanitizedTitle = title.replace(/[\/:*?"<>|]/g, "_");

		const currentTimestamp = Date.now();
		if (savedFiles[sanitizedTitle] && currentTimestamp - savedFiles[sanitizedTitle] < saveThreshold) {
			return;
		}

		chrome.downloads.download({
			url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
			filename: `${sanitizedTitle}.json`,
			saveAs: false,
		});

		savedFiles[sanitizedTitle] = currentTimestamp;
		console.log(`Response saved as: ${sanitizedTitle}.json`);
	} catch (error) {
		console.error("Error saving response to file:", error);
	}
}

// Fallback: Disable the debugger if inactive for 3 minutes
setInterval(() => {
	if (!extensionEnabled) return;

	const currentTime = Date.now();
	if (currentTime - lastCaptureTime > inactivityThreshold && targetTabId) {
		chrome.debugger.detach({
			tabId: targetTabId
		}, () => {
			console.log("Debugger detached due to inactivity");
		});
	}
}, inactivityThreshold);

// Detach debugger on extension unload
chrome.runtime.onSuspend.addListener(() => {
	if (targetTabId) {
		chrome.debugger.detach({
			tabId: targetTabId
		}, () => {
			console.log("Debugger detached on extension unload");
		});
	}
});