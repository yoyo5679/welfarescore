
# Truncate script.js to remove duplicates
lines = []
with open('script.js', 'r') as f:
    lines = f.readlines()

# Find the start of the appended block.
# The appended block starts with "var selCat = null..." or "function buildCatGrid"
# Let's search for "var selCat = null" which is the first line of v13_logic.js

cut_index = -1
count = 0
for i, line in enumerate(lines):
    # Force truncate to remove garbage tail
    cut_index = 918
    new_lines = lines[:cut_index]
    with open('script.js', 'w') as f:
        f.writelines(new_lines)
    print("Truncated at line 918.")


    # If explicit marker not found, check if we simply appended to original.
    # Original ended with `console.log('SCRIPT FULLY LOADED');`
    # Let's look for that.
    
    logs = [i for i, l in enumerate(lines) if "SCRIPT FULLY LOADED" in l]
    if len(logs) > 1:
        # Cut after the FIRST "SCRIPT FULLY LOADED"
        cut_index = logs[0] + 1
        print(f"Truncating after first 'SCRIPT FULLY LOADED' at line {cut_index}")
        new_lines = lines[:cut_index]
        with open('script.js', 'w') as f:
            f.writelines(new_lines)

