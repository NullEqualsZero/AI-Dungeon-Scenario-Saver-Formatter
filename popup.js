// document.addEventListener("DOMContentLoaded", () => {
//   console.log("Popup loaded");

//   const refreshAndSaveButton = document.getElementById("refreshAndSave");

//   refreshAndSaveButton.addEventListener("click", () => {
//     console.log("Refresh and Save button clicked");

//     // First, refresh the page
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]) {
//         chrome.tabs.reload(tabs[0].id);
//         console.log("Page refreshed");

//         // After refreshing, save GraphQL requests
//         chrome.runtime.sendMessage({ action: "saveRequests" });
//       } else {
//         console.error("No active tab found");
//       }
//     });
//   });
// });
document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded");

  const refreshAndSaveButton = document.getElementById("refreshAndSave");

  refreshAndSaveButton.addEventListener("click", () => {
    console.log("Refresh and Save button clicked");

    // First, refresh the page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Reload the page
        chrome.tabs.reload(tabs[0].id);
        console.log("Page refreshed");

        // Start capturing GraphQL requests for 20 seconds
        chrome.runtime.sendMessage({ action: "reloadAndCapture" });

        // After 20 seconds, stop capturing
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "stopCapture" });
        }, 20000); // Stop capturing after 20 seconds
      } else {
        console.error("No active tab found");
      }
    });
  });
});
