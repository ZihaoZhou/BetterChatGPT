import re
import os
from typing import List, Dict

def extract_model_options(constants_content: str) -> List[str]:
    """Extract model options from the constants file content."""
    # Look for the modelProviders declaration with more flexible whitespace handling
    matches = re.findall(r"(?:export\s+)?const\s+modelProviders\s*:\s*{\s*\[key:\s*string\]\s*:\s*ModelOptions\[\]\s*}\s*=\s*({[\s\S]*?});", constants_content)
    
    if not matches:
        # Try alternative pattern without type annotation
        matches = re.findall(r"(?:export\s+)?const\s+modelProviders\s*=\s*({[\s\S]*?});", constants_content)
    
    if not matches:
        raise ValueError("Could not find modelProviders in constants file")
    
    providers_str = matches[0]
    
    # Extract all model names using a more robust pattern
    # This pattern looks for strings in arrays within the object
    model_names = set()
    
    # First, split into provider sections
    provider_sections = re.findall(r"'[^']+'\s*:\s*\[([\s\S]*?)\]", providers_str)
    
    for section in provider_sections:
        # Extract model names from each section
        models = re.findall(r"'([^']+)'", section)
        model_names.update(models)
    
    original_names = [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0301',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-16k-0613',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-0125',
        'gpt-4',
        'gpt-4-0314',
        'gpt-4-0613',
        'gpt-4-32k',
        'gpt-4-32k-0314',
        'gpt-4-32k-0613',
        'gpt-4-1106-preview',
        'gpt-4-0125-preview',
    ]
    return sorted(list(model_names)) + original_names

def update_types_file(types_path: str, model_options: List[str]) -> None:
    """Update the types file with new model options."""
    with open(types_path, 'r') as f:
        content = f.read()
    
    # Create the new type definition
    new_type_def = 'export type ModelOptions =\n  | ' + '\n  | '.join(f"'{option}'" for option in model_options) + ';'
    
    # Replace the existing type definition
    updated_content = re.sub(
        r'export type ModelOptions =[\s\S]*?;',
        new_type_def,
        content
    )
    
    # Write the updated content back to the file
    with open(types_path, 'w') as f:
        f.write(updated_content)

def main():
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    constants_path = os.path.join(script_dir, 'src', 'constants', 'chat.ts')
    types_path = os.path.join(script_dir,  'src', 'types', 'chat.ts')
    
    # Read the constants file
    try:
        with open(constants_path, 'r') as f:
            constants_content = f.read()
            print("Found constants file, content length:", len(constants_content))
    except FileNotFoundError:
        print(f"Error: Could not find constants file at {constants_path}")
        return
    
    try:
        # Extract model options
        model_options = extract_model_options(constants_content)
        print(f"Found {len(model_options)} model options")
        
        # Update the types file
        update_types_file(types_path, model_options)
        
        print(f"Successfully updated ModelOptions type with {len(model_options)} options")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Constants file content:")
        print(constants_content[:500] + "...")  # Print first 500 chars for debugging
        return

if __name__ == "__main__":
    main()