// Initialize a Set to store unique document IDs (to prevent duplicates)
const capturedRequestIds = new Set();
const targetOperationName = "GetScenario";
// Debugger variables
let targetTabId;
let captureTimer;
const processedRequestIds = new Set();
// // Initialize an array to store captured requests
let capturedRequests = [];
// Object to track saved files and their timestamps
const savedFiles = {};
const saveThreshold = 5000; // 5 seconds threshold (adjust as needed)

// Attach debugger to the tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("aidungeon.com") && changeInfo.status === "complete") {
      if (targetTabId && targetTabId !== tabId) {
          chrome.debugger.detach({ tabId: targetTabId }, () => {
              //console.log("Debugger detached from previous tab");
          });
      }

      targetTabId = tabId;

      chrome.debugger.attach({ tabId: targetTabId }, "1.3", () => {
          //console.log("Debugger attached");

          chrome.debugger.sendCommand(
              { tabId: targetTabId },
              "Network.enable",
              {},
              () => {
                  //console.log("Network debugging enabled");
              }
          );
      });
  }
});

// Listen for network events and filter responses
chrome.debugger.onEvent.addListener((source, method, params) => {
  // Handle the "Network.responseReceived" event
  if (method === "Network.responseReceived") {
      chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          (response) => {
              try {
                  // Check if response is valid and it's a JSON response
                  if (response && response.body) {
                      // Check if the body is JSON by looking for potential errors
                      try {
                          const body = JSON.parse(response.body);
                          //console.log("Captured response:", body);

                          // Only save if it contains the expected data
                          if (body.data && body.data.scenario) {
                              saveResponseToFile(body);
                          }
                      } catch (jsonError) {
                          // If parsing fails, log it but don't process it as JSON
                          //console.log("Non-JSON response body, skipping:", jsonError.message);
                      }
                  } else {
                      //console.log("Response body is undefined or empty.");
                  }
              } catch (error) {
                  // Suppress any errors related to missing response body
                  if (error instanceof TypeError && error.message.includes("Cannot read properties of undefined")) {
                      //console.log("Ignoring error: Response body is undefined or malformed.");
                  } else {
                      //console.error("Unexpected error while handling response:", error);
                  }
              }
          }
      );
  }

  // Handle the "Debugger.error" event and suppress specific errors
  if (method === "Debugger.error") {
      try {
          if (params.message && params.message.includes("No resource with given identifier")) {
              // Ignore this specific error
              return;
          }
      } catch (error) {
          //console.error("Error handling debugger event:", error);
      }
  }
});


// Function to capture and handle requests
function captureRequest(details) {
  // Check if the request is already captured
  if (capturedRequestIds.has(details.documentId)) {
      //console.log("Duplicate request ignored:", details.documentId);
      return;
  }

  // Add the documentId to the Set to prevent future duplicates
  capturedRequestIds.add(details.documentId);

  // Decode the request body if available
  let decodedBody = null;
  if (details.requestBody && details.requestBody.raw) {
      try {
          // The requestBody.raw is an array of ArrayBuffers; decode it
          const rawBytes = details.requestBody.raw[0].bytes;
          decodedBody = new TextDecoder("utf-8").decode(rawBytes);
      } catch (error) {
          //console.error("Error decoding request body:", error);
      }
  }

  // Log the detected GraphQL request with decoded body
  // console.log("GraphQL request detected:", {
  //     ...details,
  //     decodedBody,
  // });

  // Save the decoded request details to the capturedRequests array
  capturedRequests.push({
      ...details,
      decodedBody,
  });

  // Save the captured request to a file
  saveRequestToFile({ ...details, decodedBody });
}

// Function to capture and handle requests
function captureRequest(details) {
  // Decode the request body if available
  let decodedBody = null;
  if (details.requestBody && details.requestBody.raw) {
      try {
          const rawBytes = details.requestBody.raw[0].bytes;
          decodedBody = new TextDecoder("utf-8").decode(rawBytes);
      } catch (error) {
          //console.error("Error decoding request body:", error);
      }
  }

  // Parse the body and check if it matches the target operationName
  if (decodedBody) {
      try {
          const parsedBody = JSON.parse(decodedBody);
          if (parsedBody.operationName === targetOperationName) {
              //console.log("Intercepted request with operationName:", parsedBody.operationName);
              
              // Store the request details for later use when the response is received
              requestDetailsMap[details.requestId] = details;
          }
      } catch (error) {
          //console.error("Error parsing request body:", error);
      }
  }
}

chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.responseReceived") {
      //console.log("Response received:", params);

      chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          (response) => {
              if (chrome.runtime.lastError) {
                  //console.error("Debugger error:", chrome.runtime.lastError.message);
                  return;
              }

              if (!response || !response.body) {
                  //console.warn("No body found for response:", params.response);
                  return;
              }

              try {
                  //console.log("Full response body:", response);

                  // Check if this is a GraphQL response
                  if (params.response.url.includes("/graphql")) {
                      const body = JSON.parse(response.body);
                      //console.log("Parsed response body:", body);

                      // Check for "data.scenario" in the response
                      if (body.data && body.data.scenario) {
                          //console.log("Filtered response with 'data.scenario':", body);
                          saveResponseToFile(body);
                      }
                  }
              } catch (error) {
                  //console.error("Error parsing response body:", error);
              }
          }
      );
  }
});



// Function to save the response JSON to a file
function saveResponseToFile(response) {
  try {
      const jsonContent = JSON.stringify(response, null, 2);

      // Extract the title from the response
      const scenarioTitle = response.data.scenario.title;

      // Sanitize the title to ensure it's a valid filename
      const sanitizedTitle = scenarioTitle.replace(/[\/:*?"<>|]/g, "_");

      // Check if the file has already been saved recently
      const currentTimestamp = Date.now();
      if (savedFiles[sanitizedTitle]) {
          const lastSavedTimestamp = savedFiles[sanitizedTitle];

          // If the file was saved recently (within the threshold), skip saving it
          if (currentTimestamp - lastSavedTimestamp < saveThreshold) {
              //console.log(`File ${sanitizedTitle}.json already saved recently. Skipping save.`);
              return;
          }
      }

      // Save the file with the scenario title as the filename
      chrome.downloads.download({
          url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
          filename: `${sanitizedTitle}.json`,
          saveAs: false,
      });

      // Update the savedFiles object with the new timestamp
      savedFiles[sanitizedTitle] = currentTimestamp;

      //console.log("Response saved to file with title:", sanitizedTitle);
  } catch (error) {
      //console.error("Error saving response to file:", error);
  }
}


// Detach debugger on extension unload
chrome.runtime.onSuspend.addListener(() => {
  if (targetTabId) {
      chrome.debugger.detach({ tabId: targetTabId }, () => {
          //console.log("Debugger detached");
      });
  }
});

// // Debugging: log captured responses periodically (optional)
// setInterval(() => {
//   console.log("Captured Responses:", capturedRequests);
// }, 10000);

