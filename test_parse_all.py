import os

def check_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    line_num = 1
    
    for i, char in enumerate(content):
        if char == '\n':
            line_num += 1
        elif char == '{':
            stack.append((line_num, i))
        elif char == '}':
            if stack:
                stack.pop()
            else:
                return f"Extra '}}' at line {line_num}"

    if stack:
        return f"Missing {len(stack)} '}}'. Unclosed at line {stack[-1][0]}"

    return "OK"

for root, dirs, files in os.walk('csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            path = os.path.join(root, file)
            res = check_braces(path)
            if res != "OK":
                print(f"{path}: {res}")
print("Check completed.")
