# AI Dungeon Scenario Formatter

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

1. Download and run the **AI Dungeon Scenario Formatter** EXE.
2. Choose the scenario JSON file you wish to format.
3. Click "Convert" to generate the TXT and MD files.
4. Save the files to your preferred location.
