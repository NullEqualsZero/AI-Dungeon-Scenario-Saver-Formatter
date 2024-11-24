# AI Dungeon Scenario Formatter

## License

This project is licensed under the MIT License. If you use this project for commercial purposes or modify it, **appropriate credit must be given to the original author (NullEqualsZero)**, and you must inform the author about its usage. See the `LICENSE` file for details.

## Overview

The **AI Dungeon Scenario Formatter** is a tool designed to format AI Dungeon scenario JSON files into human-readable TXT and MD files. It simplifies the process of viewing and sharing your saved scenarios with clean formatting and easy access to the scenario data.

## Features

- **JSON to TXT & MD Conversion**: Converts the AI Dungeon scenario JSON files into two formats:
  - **TXT**: Plain text file with scenario information.
  - **MD**: Markdown file for better readability and sharing.
- **Scenario-Only Focus**: The tool extracts and formats only the relevant scenario data, leaving out unnecessary metadata and other information.

## Why Not Build This Into the Extension?

The reason this tool exists as a separate EXE is twofold:

1. **Development Order**: This tool was created before the AI Dungeon Scenario Saver extension, so it has been built as a standalone utility first.
2. **Flexibility with Story Cards**: The tool allows you to not only format the starting scenario but also to integrate additional story cards saved separately. For example, if you’ve saved a scenario but also saved extra story cards from AI Dungeon’s built-in export feature, this tool enables you to format and merge them with the initial scenario, creating a more complete story output.

This added functionality makes it easier to manage scenarios and additional story elements outside of what’s captured by the extension.

## How It Works

1. **Select JSON File**: Choose a JSON file containing the scenario data from AI Dungeon.
2. **Format**: The tool processes the JSON and extracts relevant information, focusing on the scenario details.
3. **Save Output**: The tool generates both a TXT and a Markdown (MD) file with the formatted scenario data.

### Usage Instructions

1. **Run the application**:
   - On Windows: Double-click the executable.

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/c6077ec1-1c3b-4ca7-b618-1506c012ff61" alt="Windows Run" width="60%">
   </div>

   - On other platforms: Run the script using Python (`python script_name.py`).

2. **Step 1: Input Directory**:
   - Select the folder containing JSON files to process.

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/d127c04a-2f47-426b-a423-12da362c55f7" alt="Input Directory" width="60%">
   </div>

   - Enable or disable "Skip Extra Story Cards" as needed.
   - Click **Next** or **Start Processing**.
   - If skipped:

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/8ecfc83c-4cdd-4525-8dca-9d5fc6de164e" alt="Skipped" width="60%">
   </div>

   - If not skipped:

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/1008c826-8039-4ef6-a5a3-4f4b1ad56b40" alt="Not Skipped" width="60%">
   </div>

3. **Step 2: Assign Extra Cards** (if not skipped):
   - For each JSON file, select an additional JSON file for extra story cards.

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/ca9b0817-2cab-45ba-a588-c3ebdcce3d57" alt="Assign Extra Cards" width="60%">
   </div>

   - Click **Start Processing**.

4. **Processing**:
   - The app formats the stories and saves the output in a new folder named `Scenarios_Formatted` next to the input folder.

   <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/f8bbbff4-7200-4509-8afe-2ffb4629a375" alt="Processing Output" width="60%">
   </div>

## Output

- Formatted `.txt` and `.md` files are saved in the output directory.
  <div style="text-align: center; padding: 10px;">
     <img src="https://github.com/user-attachments/assets/aa7dc353-23af-45a0-a54b-5d4df9ade9c1" alt="Processing Output" width="60%">
   </div


## Requirements

### If you run it directly with Python you need the following if you use the executable you don't need this.

- Python 3.6 or higher
- `tkinter` module (pre-installed with Python)
