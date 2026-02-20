
import os

target_path = "/Users/hong-eunseong/Documents/안티그래비티/블로그/welfare-score-app/script.js"

with open(target_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find the split point where duplicates start?
# Or just keep the LAST definition?
# The second half was appended via 'cat v13_logic.js >> script.js'
# So if we find the V13 logic start marker from v13_logic.js in the middle...

# v13_logic.js starts with: "var selCat = null, QI = 0, ANS = [], QD = [];"
# Let's find this line. IF it appears twice, we cut before the second occurrence?
# Actually, wait. restore_script.py restored from script.js.bak.
# script.js.bak was a COPY of script.js which ALREADY HAD V13 logic (but was failing).
# Then I appended v13_logic.js AGAIN.
# So I have: [Data] + [Old V13 Logic from Backup] + [New V13 Logic from File]
# I should remove the [New V13 Logic from File] part IF [Old V13 Logic] is correct.
# BUT [Old V13 Logic] might be corrupted (syntax errors).
# So better to remove [Old V13 Logic] and keep [New V13 Logic]?
# The [Old V13 Logic] is mixed in with selectOption etc.

# Let's see where the duplication starts.
# "var selCat = null" is a good indicator.

marker = "var selCat = null, QI = 0, ANS = [], QD = [];"
indices = [i for i, line in enumerate(lines) if marker in line]

if len(indices) > 1:
    print(f"Found duplicates at lines: {indices}")
    # The first one is from restore (backup). The second is from append.
    # We want to keep the appended one (it's clean) and remove the old one?
    # BUT the old one is continuous with selectOption...
    # Let's see.
    # restore_script.py took "function selectOption" onwards.
    
    # If I cut from the FIRST occurrence of marker, do I lose selectOption?
    # marker is usually AFTER selectOption.
    
    # improved strategy:
    # 1. generated_data.js (data)
    # 2. selectOption function (needed)
    # 3. V13 logic (needed, but clean)
    
    # Let's look at the file content around the first marker.
    pass

