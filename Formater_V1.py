import json
import os

def format_story(input_file, output_directory, extra_story_cards=None):
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extracting relevant sections
        scenario = data.get("data", {}).get("scenario", {})
        
        title = scenario.get("title", "Untitled")
        description = scenario.get("description", "No description available.")
        plot = scenario.get("prompt", "No plot available.")
        memory = scenario.get("memory", "No memory information available.")
        authors_note = scenario.get("authorsNote", "No author's notes provided.")
        story_cards = scenario.get("storyCards", [])

        # Handle extra story cards
        if extra_story_cards:
            try:
                with open(extra_story_cards, 'r', encoding='utf-8') as extra_file:
                    new_cards = json.load(extra_file)
                    for new_card in new_cards:
                        # Check for duplicate titles and rename if necessary
                        existing_titles = {card['title'] for card in story_cards}
                        if new_card['title'] in existing_titles:
                            new_card['title'] += " V2"
                        story_cards.append(new_card)
            except (FileNotFoundError, json.JSONDecodeError):
                print(f"Error: Could not process the story card file '{extra_story_cards}'.")

        # Formatting story cards
        story_cards_formatted = ""
        for card in story_cards:
            card_title = card.get("title", "Unnamed Card")
            card_keys = card.get("keys", "No keys available.")
            card_description = card.get("description", "No description available.")
            story_cards_formatted += f"- **{card_title}:**\n  Keys: {card_keys}\n  Description: {card_description}\n\n"
        
        # Creating the formatted content
        formatted_content = f"""\

### {title}

#### Description
{description}

#### Plot
{plot}

#### Memory
{memory}

#### Author's Notes
{authors_note}

#### Character Cards
{story_cards_formatted}
"""
        # Generating the output filename
        base_name = os.path.splitext(os.path.basename(input_file))[0]
        output_file = os.path.join(output_directory, f"{base_name}.txt")
        
        # Writing to the output file
        with open(output_file, 'w', encoding='utf-8') as out_file:
            out_file.write(formatted_content)
        
        print(f"Formatted content saved to {output_file}")
    except (FileNotFoundError, json.JSONDecodeError):
        print(f"Error: File '{input_file}' is not a valid JSON file or is missing required fields.")
    except UnicodeDecodeError:
        print(f"Error: File '{input_file}' contains unsupported characters and could not be read.")

def process_directory(directory, output_directory):
    # Discover JSON files
    json_files = [f for f in os.listdir(directory) if f.endswith('.json')]
    if not json_files:
        print(f"No JSON files found in directory '{directory}'.")
        return

    print(f"In the directory '{directory}', I found these files:")
    for file in json_files:
        print(f"- {file}")
    input("\nPress Enter to continue...")

    # Ensure the output directory exists
    os.makedirs(output_directory, exist_ok=True)

    # Process each file
    for filename in json_files:
        input_file = os.path.join(directory, filename)
        print(f"\nProcessing file: {filename}")
        extra_cards_path = input("Do you want to add extra story cards to this file? Provide the path or press Enter to skip: ").strip()
        extra_cards_path = extra_cards_path if extra_cards_path else None
        format_story(input_file, output_directory, extra_story_cards=extra_cards_path)

if __name__ == "__main__":
    # Ask for input directory and output directory
    input_directory = input("Enter the directory containing JSON files: ").strip()
    output_directory = input("Enter the directory to save formatted text files: ").strip()
    
    process_directory(input_directory, output_directory)
