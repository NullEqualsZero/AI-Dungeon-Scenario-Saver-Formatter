# AI Dungeon Scenario Saver

## Latest Release Notes

**Version 1.2.0**
- Debugger now detaches (removing the page debugger warning) much faster. 
- Debugger now detaches automatically after a file is saved.

**Version 1.1.0**
- Added a toggle switch to enable or disable the extension.
- Improved clarity and efficiency in how scenarios are captured and saved.
- Refactored code to remove unnecessary elements and streamline functionality.
  
## License

This project is licensed under the MIT License. If you use this project for commercial purposes or modify it, **appropriate credit must be given to the original author (NullEqualsZero)**, and you must inform the author about its usage. See the `LICENSE` file for details.

## Overview

AI Dungeon Scenario Saver is a browser extension that automates the process of capturing and saving AI Dungeon scenarios. It leverages the browser’s debugging tools to detect and extract the necessary data seamlessly.

## Features

- **Toggle for Debugging**: Enable or disable the extension with a switch, ensuring peace of mind for users wary of debugging tools.
- **Automatic Scenario Capture**: Efficiently captures the scenario data when the page is refreshed.
- **Save to File**: Automatically saves the captured data as a JSON file.
- **Streamlined Functionality**: Clean and efficient code base for better performance.

## How It Works

1. **Enable the Extension**: Use the toggle switch to enable or disable the extension as needed.
2. **Page Monitoring**: Once enabled, the extension monitors AI Dungeon pages for specific GraphQL responses.
3. **Scenario Capture**: It identifies and captures the relevant data from the server responses.
4. **Automatic Saving**: The data is saved as a JSON file on your computer with a sanitized filename based on the scenario title.

### Important Notes

- **Debugger Permissions**: Since the extension uses Chrome debugging tools, it may request permissions to attach to your active tab. This is essential for capturing the data.
- **File Saving**: Files are automatically saved without the need for additional prompts.

## Issues Addressed

- Duplicate captures and excessive file saves have been resolved by adding a threshold mechanism to prevent saving the same data repeatedly within a short period.
- Fixed occasional failure to capture responses on the first attempt by ensuring robust data monitoring and handling.
- **Full Compatibility**: Both scenarios and adventures are now supported for saving.

## Support

If you encounter any issues or have suggestions for improvement, please create an issue in this repository. I’ll do my best to address them promptly.

Enjoy seamless AI Dungeon scenario saving!
