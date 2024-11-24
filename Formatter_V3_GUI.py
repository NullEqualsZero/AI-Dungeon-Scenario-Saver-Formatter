import tkinter as tk
from tkinter import filedialog, messagebox
import os
import json

class StoryFormatterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Story Formatter")
        
        self.input_dir = None
        self.output_dir = None
        self.files = []
        self.extra_cards_enabled = tk.BooleanVar(value=False)
        self.extra_cards_paths = {}
        self.file_widgets = {}  # Initialize this here to prevent attribute errors
        
        self.step1_frame = None
        self.step2_frame = None
        
        self.create_step1()

    def create_step1(self):
        # Step 1: Input Directory and File Discovery
        self.clear_frame()  # Clear any existing frame widgets before creating new ones
        self.step1_frame = tk.Frame(self.root)
        self.step1_frame.pack(padx=10, pady=10, fill="both", expand=True)
        
        print("Creating Step 1 frame...")
        
        tk.Label(self.step1_frame, text="Select Input Folder").pack(anchor="w", pady=5)
        
        input_dir_frame = tk.Frame(self.step1_frame)
        input_dir_frame.pack(fill="x", pady=5)
        self.input_dir_entry = tk.Entry(input_dir_frame, width=50)
        self.input_dir_entry.pack(side="left", padx=5, fill="x", expand=True)
        tk.Button(input_dir_frame, text="Browse", command=self.browse_input_dir).pack(side="left", padx=5)
        
        tk.Label(self.step1_frame, text="Output Folder: Will be created automatically next to input folder").pack(anchor="w", pady=5)
        
        self.extra_cards_checkbox = tk.Checkbutton(
            self.step1_frame,
            text="Skip Extra Story Cards",
            variable=self.extra_cards_enabled,
            command=self.update_next_button_text  # Call this when checkbox is toggled
        )
        self.extra_cards_checkbox.pack(anchor="w", pady=5)
        
        # Create the Next button
        self.create_next_button(self.process_step1, text="Next", frame=self.step1_frame)

    def update_next_button_text(self):
        # Change the button text to "Start Processing" if checkbox is checked
        if self.extra_cards_enabled.get():
            print("Checkbox is checked - changing button text to 'Start Processing'")
            self.create_next_button(self.process_files, text="Start Processing", frame=self.step1_frame)
        else:
            print("Checkbox is unchecked - changing button text to 'Next'")
            self.create_next_button(self.process_step1, text="Next", frame=self.step1_frame)

    def create_next_button(self, command, text="Next", frame=None):
        # Destroy and recreate the button in the appropriate frame
        if hasattr(self, 'next_button') and self.next_button.winfo_exists():
            self.next_button.destroy()
        
        self.next_button = tk.Button(frame, text=text, command=command)
        self.next_button.pack(pady=10)

    def browse_input_dir(self):
        directory = filedialog.askdirectory()
        if directory:
            self.input_dir_entry.delete(0, tk.END)
            self.input_dir_entry.insert(0, directory)

    def setup_environment(self):
        """Ensure the output folder is created and JSON files are discovered."""
        print("Setting up environment...")

        # Validate the input directory
        self.input_dir = self.input_dir_entry.get()
        if not os.path.isdir(self.input_dir):
            print("Invalid input folder. Exiting setup_environment().")
            messagebox.showerror("Error", "Invalid input folder!")
            return False

        # Generate output folder path
        print("Generating output folder path...")
        self.output_dir = os.path.join(
            os.path.dirname(self.input_dir),
            "Scenarios_Formatted"
        )
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"Output folder created at: {self.output_dir}")

        # Discover JSON files
        print("Discovering JSON files...")
        self.files = [f for f in os.listdir(self.input_dir) if f.endswith('.json')]
        print(f"Found {len(self.files)} JSON files in the input folder.")

        if not self.files:
            print("No JSON files found. Exiting setup_environment().")
            messagebox.showinfo("Info", "No JSON files found in the input folder.")
            return False

        return True

    def process_step1(self):
        """Handle the main flow for Step 1."""
        print("Entered process_step1()")

        # Setup environment: output folder and JSON file discovery
        if not self.setup_environment():
            return

        # Handle the checkbox state
        if self.extra_cards_enabled.get():
            print("Skip Extra Story Cards is checked. Passing None for all extra cards.")
            self.extra_cards_paths = {file: None for file in self.files}  # Set None for all extra cards
            self.process_files()  # Process files directly
        else:
            print("Proceeding to Step 2 for extra card assignment.")
            self.create_step2()


    def create_step2(self):
        # Step 2: Assign Extra Story Cards
        print("Creating Step 2 frame...")
        self.clear_frame()  # Clear previous frame before showing Step 2
        self.step2_frame = tk.Frame(self.root)
        self.step2_frame.pack(padx=10, pady=10, fill="both", expand=True)
        
        tk.Label(self.step2_frame, text="Step 2: Assign Extra Story Cards").pack(anchor="w", pady=5)
        
        self.file_frame = tk.Frame(self.step2_frame)
        self.file_frame.pack(fill="both", expand=True, pady=5)
        
        self.file_widgets = {}  # Initialize file_widgets here
        for file in self.files:
            row_frame = tk.Frame(self.file_frame)
            row_frame.pack(fill="x", pady=2)
            
            tk.Label(row_frame, text=file).pack(side="left", padx=5)
            entry = tk.Entry(row_frame, width=40)
            entry.pack(side="left", padx=5, fill="x", expand=True)
            tk.Button(row_frame, text="Browse", command=lambda e=entry: self.browse_extra_card(e)).pack(side="left", padx=5)
            
            self.file_widgets[file] = entry
        
        # Change button text to "Start Processing" for Step 2
        self.create_next_button(self.process_files, text="Start Processing", frame=self.step2_frame)

    def browse_extra_card(self, entry_widget):
        file_path = filedialog.askopenfilename(filetypes=[("JSON files", "*.json")])
        if file_path:
            entry_widget.delete(0, tk.END)
            entry_widget.insert(0, file_path)

    def process_files(self):
        """Process all files."""
        print("Processing files...")

        # Ensure the environment is set up if skipped via checkbox
        if not self.files:  # If files haven't been discovered, run setup
            print("Files not discovered yet. Running setup_environment()...")
            if not self.setup_environment():
                return

        # Collect extra story card paths
        if self.extra_cards_enabled.get():
            print("Skip Extra Story Cards enabled. Setting None for all extra card paths.")
            self.extra_cards_paths = {file: None for file in self.files}

        # Process each file
        for file in self.files:
            input_file = os.path.join(self.input_dir, file)
            extra_cards_path = self.extra_cards_paths.get(file, None)
            try:
                self.format_story(input_file, self.output_dir, extra_cards_path)
            except Exception as e:
                messagebox.showerror("Error", f"Error processing {file}: {e}")

        messagebox.showinfo("Done", "All files processed successfully!")
        self.root.quit()

    def format_story(self, input_file, output_directory, extra_story_cards=None):
        print(f"Formatting {input_file}...")
        try:
            with open(input_file, 'r', encoding='utf-8') as file:
                data = json.load(file)

            scenario = data.get("data", {}).get("scenario", {})
            title = scenario.get("title", "Untitled")
            description = scenario.get("description", "No description available.")
            plot = scenario.get("prompt", "No plot available.")
            memory = scenario.get("memory", "No memory information available.")
            authors_note = scenario.get("authorsNote", "No author's notes provided.")
            story_cards = scenario.get("storyCards", [])
            options = scenario.get("options", [])

            if extra_story_cards:
                try:
                    with open(extra_story_cards, 'r', encoding='utf-8') as extra_file:
                        new_cards = json.load(extra_file)
                        for new_card in new_cards:
                            existing_titles = {card['title'] for card in story_cards}
                            if new_card['title'] in existing_titles:
                                new_card['title'] += " V2"
                            story_cards.append(new_card)
                except Exception as e:
                    print(f"Error adding extra story cards for {input_file}: {e}")

            # Format story cards
            story_cards_formatted = ""
            for card in story_cards:
                card_title = card.get("title", "Unnamed Card")
                card_keys = card.get("keys", "No keys available.")
                card_description = card.get("description", "No description available.")
                story_cards_formatted += f"- **{card_title}:**\n  Keys: {card_keys}\n  Description: {card_description}\n\n"

            # Format options (branching scenarios)
            options_formatted = ""
            parent_scenarios = [opt for opt in options if opt.get("parentScenarioId") is None]
            child_scenarios = {opt.get("parentScenarioId"): [] for opt in options if opt.get("parentScenarioId")}

            for opt in options:
                parent_id = opt.get("parentScenarioId")
                if parent_id:
                    child_scenarios[parent_id].append(opt)

            # Check if options have more than one branching scenario (only create branches if there are multiple)
            if len(options) > 1:
                # Multiple options: check for parentScenarioId: null to decide user question
                plot_section = f"#### User Question\n{parent_scenarios[0].get('prompt', 'No prompt available.')}\n\n" if parent_scenarios else f"#### Plot\n{plot}\n\n"
                for parent in parent_scenarios:
                    options_formatted += f"### {parent.get('title', 'Untitled')}\n\n"
                    options_formatted += f"{parent.get('prompt', 'No prompt available.')}\n\n"
                    for child in child_scenarios.get(parent.get('id'), []):
                        options_formatted += f"- **{child.get('title', 'Untitled')}**:\n  {child.get('prompt', 'No prompt available.')}\n\n"
            else:
                # Only one option, treat it as Plot
                plot_section = f"#### Plot\n{plot}\n\n"
                options_formatted = ""

            # Add extra line breaks where necessary (long prompt descriptions)
            def break_text(text, line_length=80):
                # Escaping special characters like ${Your name?} to avoid markdown formatting
                text = text.replace("${", "\\${").replace("}", "\\}")  # Escape `${}` characters
                lines = []
                current_line = []
                words = text.split(" ")
                for word in words:
                    if sum(len(w) for w in current_line) + len(word) + len(current_line) > line_length:
                        lines.append(" ".join(current_line))
                        current_line = [word]
                    else:
                        current_line.append(word)
                if current_line:
                    lines.append(" ".join(current_line))
                return "\n".join(lines)

            # Apply text wrapping to the prompt if it's too long
            formatted_plot = break_text(plot)
            formatted_description = break_text(description)
            formatted_memory = break_text(memory)
            formatted_authors_note = break_text(authors_note)

            # Combine everything into formatted content with added spacing
            formatted_content = f"""\
### {title}

#### Description
{formatted_description}

{plot_section}

#### Memory
{formatted_memory}

#### Author's Notes
{formatted_authors_note}

#### Character Cards
{story_cards_formatted}

#### Branches
{options_formatted}
"""
            # Save the formatted content to both .txt and .md files
            base_name = os.path.splitext(os.path.basename(input_file))[0]
            txt_output_file = os.path.join(output_directory, f"{base_name}.txt")
            md_output_file = os.path.join(output_directory, f"{base_name}.md")

            # Save as .txt
            with open(txt_output_file, 'w', encoding='utf-8') as out_file:
                out_file.write(formatted_content)
            
            # Save as .md (Markdown)
            with open(md_output_file, 'w', encoding='utf-8') as out_file:
                out_file.write(formatted_content)

            print(f"Formatted content saved to {txt_output_file} and {md_output_file}")

        except Exception as e:
            print(f"Error processing {input_file}: {e}")


    def clear_frame(self):
        # Clear any existing frame widgets before creating new ones
        for widget in self.root.winfo_children():
            widget.destroy()

# Run the application
if __name__ == "__main__":
    root = tk.Tk()
    app = StoryFormatterApp(root)
    root.mainloop()
