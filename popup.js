document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded");

  const refreshAndSaveButton = document.getElementById("refreshAndSave");
  const extensionToggle = document.getElementById("extensionToggle");
  let timeoutHandle = null;

  // Function to toggle extension state
  function toggleExtension(state) {
    if (state) {
      console.log("Extension enabled");
      refreshAndSaveButton.disabled = false;

      // Send a message to enable the extension
      chrome.runtime.sendMessage({ action: "enableExtension" });

      // Set a timeout to turn off after 10 minutes
      timeoutHandle = setTimeout(() => {
        extensionToggle.checked = false;
        toggleExtension(false);
      }, 5 * 60 * 1000); // 10 minutes in milliseconds
    } else {
      console.log("Extension disabled");
      refreshAndSaveButton.disabled = true;

      // Send a message to disable the extension
      chrome.runtime.sendMessage({ action: "disableExtension" });

      // Clear the timeout if it exists
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    }
  }

  // Handle toggle switch changes
  extensionToggle.addEventListener("change", (event) => {
    toggleExtension(event.target.checked);
  });

  // Handle the refresh and save button click
  refreshAndSaveButton.addEventListener("click", () => {
    console.log("Refresh and Save button clicked");

    // Only proceed if the extension is enabled
    if (!extensionToggle.checked) {
      console.warn("Extension is disabled. Enable it first.");
      return;
    }

    // Refresh the active tab and start capturing
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        console.log("Page refreshed");

        chrome.runtime.sendMessage({ action: "reloadAndCapture" });

        // Stop capturing after 20 seconds
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "stopCapture" });
        }, 20000);
      } else {
        console.error("No active tab found");
      }
    });
  });
});

