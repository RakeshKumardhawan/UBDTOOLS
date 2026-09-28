with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

open_braces = content.count('{')
close_braces = content.count('}')
print(f"Open Braces: {open_braces}")
print(f"Close Braces: {close_braces}")

# Let's find where it breaks
stack = []
for i, char in enumerate(content):
    if char == '{':
        stack.append(i)
    elif char == '}':
        if len(stack) > 0:
            stack.pop()
        else:
            print(f"Unmatched closing brace at index {i}")

if len(stack) > 0:
    print(f"Unmatched opening braces at indices: {stack}")
    for idx in stack:
        start = max(0, idx - 50)
        end = min(len(content), idx + 50)
        print(f"Context for '{idx}': {content[start:end]}")
