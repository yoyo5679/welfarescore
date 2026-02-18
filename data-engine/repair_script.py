import os

file_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/script.js"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We want to keep lines 1 to 744 (indices 0 to 743)
# And lines 1131 to end (indices 1130 to end)

# Verify line 744 is '];\n'
if lines[743].strip() != '];':
    print(f"Warning: Line 744 is {lines[743]}")

# Verify line 1131 starts with '//'
if not lines[1130].strip().startswith('//'):
    print(f"Warning: Line 1131 is {lines[1130]}")

# Slice
new_lines = lines[:744] + lines[1130:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Repaired script.js. Lines: {len(lines)} -> {len(new_lines)}")
