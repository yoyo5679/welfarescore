import re
import os

BASE_DIR = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app"
GEN_DATA_PATH = os.path.join(BASE_DIR, "data-engine/generated_data.js")
SCRIPT_PATH = os.path.join(BASE_DIR, "script.js")

def inject_data():
    print("Reading generated data...")
    with open(GEN_DATA_PATH, "r", encoding="utf-8") as f:
        new_data_content = f.read().strip()
    
    # Remove "const nationwideWelfareData = " and ";" if present to get just the array?
    # Actually, generated_data.js IS the full definition: "const nationwideWelfareData = [...];"
    # So we can just replace the whole definition in script.js.
    
    print("Reading script.js...")
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        script_content = f.read()
    
    # Regex to find the existing definition
    # Pattern: const nationwideWelfareData = [ ... ]; 
    # We need to be careful about nested brackets, but since it's a top-level const, 
    # we can try to match until the semicolon that closes the statement.
    
    # Regex that tolerates comments/whitespace
    pattern = r"const welfareData\s*=\s*\[.*?\];"
    
    match = re.search(pattern, script_content, re.DOTALL)
    
    if match:
        print("Found existing data block. Replacing...")
        new_script_content = script_content.replace(match.group(0), new_data_content)
        
        with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
            f.write(new_script_content)
        print("Successfully updated script.js")
    else:
        print("Could not find nationwideWelfareData block in script.js")

if __name__ == "__main__":
    inject_data()
