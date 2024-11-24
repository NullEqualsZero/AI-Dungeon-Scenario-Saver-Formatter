// Initialize a Set to store unique document IDs (to prevent duplicates)
const capturedRequestIds = new Set();
const targetOperationName = "GetScenario";
// Debugger variables
let targetTabId;
// // Initialize an array to store captured requests
let capturedRequests = [];

// Attach debugger only to tabs with the AI Dungeon URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("aidungeon.com") && changeInfo.status === "complete") {
      // Detach debugger if already attached to another tab
      if (targetTabId && targetTabId !== tabId) {
          chrome.debugger.detach({ tabId: targetTabId }, () => {
              console.log("Debugger detached from previous tab");
          });
      }

      targetTabId = tabId;

      chrome.debugger.attach({ tabId: targetTabId }, "1.3", (err) => {
          if (chrome.runtime.lastError) {
              console.warn("Debugger already attached or error:", chrome.runtime.lastError.message);
              return;
          }

          console.log("Debugger attached to tab:", targetTabId);

          chrome.debugger.sendCommand(
              { tabId: targetTabId },
              "Network.enable",
              {},
              () => console.log("Network debugging enabled")
          );
      });
  }
});

// Listen for network events and handle responses
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.responseReceived") {
      chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          (response) => {
              try {
                  if (response && response.body && params.response.url.includes("/graphql")) {
                      const body = JSON.parse(response.body);

                      // Filter responses that match the target operation name
                      if (body.data && body.data.scenario) {
                          console.log("Filtered GraphQL response:", body.data);
                          saveResponseToFile(body.data); // Save valid responses to a file
                      }
                  }
              } catch (error) {
                  console.error("Error parsing response body:", error);
              }
          }
      );
  }
});

// Function to capture and handle requests
function captureRequest(details) {
  // Check if the request is already captured
  if (capturedRequestIds.has(details.documentId)) {
      console.log("Duplicate request ignored:", details.documentId);
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
          console.error("Error decoding request body:", error);
      }
  }

  // Log the detected GraphQL request with decoded body
  console.log("GraphQL request detected:", {
      ...details,
      decodedBody,
  });

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
          console.error("Error decoding request body:", error);
      }
  }

  // Parse the body and check if it matches the target operationName
  if (decodedBody) {
      try {
          const parsedBody = JSON.parse(decodedBody);
          if (parsedBody.operationName === targetOperationName) {
              console.log("Intercepted request with operationName:", parsedBody.operationName);
              
              // Store the request details for later use when the response is received
              requestDetailsMap[details.requestId] = details;
          }
      } catch (error) {
          console.error("Error parsing request body:", error);
      }
  }
}

// Listen for network events and filter responses
chrome.debugger.onEvent.addListener((source, method, params) => {
  if (method === "Network.responseReceived") {
      chrome.debugger.sendCommand(
          { tabId: source.tabId },
          "Network.getResponseBody",
          { requestId: params.requestId },
          (response) => {
              try {
                  if (params.response.url.includes("/graphql")) {
                      const body = JSON.parse(response.body);
                      console.log("Captured response:", body);

                      // Check for the target operationName
                      if (body.data && body.data.operationName === targetOperationName) {
                          saveResponseToFile(body.data);
                      }
                  }
              } catch (error) {
                  console.error("Error parsing response body:", error);
              }
          }
      );
  }
});


// Function to save the filtered response JSON to a file
function saveResponseToFile(response) {
  try {
      const jsonContent = JSON.stringify(response, null, 2);

      chrome.downloads.download({
          url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
          filename: `graphql_response_${Date.now()}.json`,
          saveAs: false,
      });

      console.log("Response saved to file");
  } catch (error) {
      console.error("Error saving response to file:", error);
  }
}

// Detach debugger when the extension is suspended
chrome.runtime.onSuspend.addListener(() => {
  if (targetTabId) {
      chrome.debugger.detach({ tabId: targetTabId }, () => {
          console.log("Debugger detached on suspend");
      });
  }
});


// Debugging: log captured responses periodically (optional)
setInterval(() => {
  console.log("Captured Responses:", capturedResponses);
}, 10000);

