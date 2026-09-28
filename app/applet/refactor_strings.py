import os
import re

def refactor_interpolated(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Simple regex to find $ " ... { ... } ... "
    # This is a bit tricky for multi-line or complex nesting, but let's try a heuristic
    
    def replacer(match):
        s = match.group(1)
        # Extract variables between { }
        vars = re.findall(r'\{(.*?)\}', s)
        if not vars:
            return f'"{s}"'
        
        template = s
        for i, v in enumerate(vars):
            template = template.replace(f'{{{v}}}', f'{{{i}}}')
        
        return f'string.Format("{template}", {", ".join(vars)})'

    # Match $"..."
    new_content = re.sub(r'\$"(.*?)"', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Refactored: {filepath}")

for root, dirs, files in os.walk('./csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            refactor_interpolated(os.path.join(root, file))
