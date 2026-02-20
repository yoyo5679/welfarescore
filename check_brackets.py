
def check_brackets(filename):
    stack = []
    brackets = {'{': '}', '[': ']', '(': ')'}
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        line_num = i + 1
        for j, char in enumerate(line):
            if char in brackets.keys():
                stack.append((char, line_num, j + 1))
            elif char in brackets.values():
                if not stack:
                    print(f"Error: Unexpected closing bracket '{char}' at line {line_num}, column {j + 1}")
                    return
                
                last_open, last_line, last_col = stack.pop()
                expected_close = brackets[last_open]
                
                if char != expected_close:
                    print(f"Error: Mismatched bracket. Expected '{expected_close}' for '{last_open}' (from line {last_line}) but found '{char}' at line {line_num}, column {j + 1}")
                    return

    if stack:
        last_open, last_line, last_col = stack[-1]
        print(f"Error: Unclosed bracket '{last_open}' at line {last_line}, column {last_col}")
    else:
        print("Success: No mismatched brackets found.")

check_brackets('script.js')
