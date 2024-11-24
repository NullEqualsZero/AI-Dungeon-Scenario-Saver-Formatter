# AI Dungeon Scenario Saver

## Overview

AI Dungeon Scenario Saver is a browser extension that automates the process of capturing and saving AI Dungeon scenarios. It uses the browser’s debugging tools to capture the required data and save it as a file on your computer.

## Features

- **Automatic Scenario Capture**: Refreshes the page and captures the scenario data automatically.
- **Save to File**: After capturing the scenario, it saves the data as a file on your computer.
- **Customizable**: Can be easily adapted for use with different configurations if needed.

## How It Works

1. **Page Refresh**: The extension will refresh the page to capture the latest AI Dungeon scenario.
2. **Scenario Capture**: After refreshing, the extension listens for the appropriate GraphQL response that contains the scenario data.
3. **Saving**: Once the response is captured, the extension saves it as a JSON file on your computer.

### Important Notes

- The extension works with google debugging. So when you click on save a pop up will appear like this.
- ![image](https://github.com/user-attachments/assets/61a1e6a0-c427-4f0a-b397-7ebfc6a90f99)
- If you encounter issues, make an issue here and I will try to fix them.

## Known Issues

- **Multiple Captures**: The extension may capture the same response multiple times due to the way it’s set up, which results in saving the scenario multiple times.
- **Failed Capture**: Sometimes, the extension may fail to capture the response on the first try. You may need to click the “Save Scenario” button again to successfully save the file.
- **Limited to Scenarios**: Currently, the extension works for capturing scenarios but does not support capturing adventures. Work is underway to extend compatibility to adventures.

These issues are primarily noticeable in the developer console and do not affect the core functionality of the extension.

---

This version includes the new issue regarding adventures and keeps the rest of the information concise and user-focused.
