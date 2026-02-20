
# Hard truncate script.js at line 1032 (before second currentBenefits)
lines = []
with open('script.js', 'r') as f:
    lines = f.readlines()

# Grep said 1032 is `let currentBenefits`
# Let's check line 1031 (0-indexed -> 1031 is line 1032)
if len(lines) >= 1032:
    print(f"Line 1032 content: {lines[1031]}")
    # Truncate strictly before this
    new_lines = lines[:1031]
    with open('script.js', 'w') as f:
        f.writelines(new_lines)
    print("Truncated at line 1031.")
else:
    print(f"File shorter than 1032 lines: {len(lines)}")
