import sys

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
                print(f"ERROR: Extra closing brace '}}' at line {line_num}")
                return False

    if stack:
        print(f"ERROR: Missing {len(stack)} closing braces '}}'.")
        print("Unclosed braces opened at lines:")
        for line, _ in stack:
            print(f"  Line {line}")
        return False

    print("SUCCESS: All braces match perfectly.")
    return True

check_braces('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs')
