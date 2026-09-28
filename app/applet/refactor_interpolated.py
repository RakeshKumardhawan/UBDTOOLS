import os
import re

def refactor_interpolated(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    def replacer(match):
        s = match.group(1)
        # Extract variables between { }
        # This regex is very simple and might fail on nested braces, but usually okay for log messages
        vars = re.findall(r'\{(.*?)\}', s)
        if not vars:
            return f'"{s}"'
        
        template = s
        format_args = []
        for i, v in enumerate(vars):
            template = template.replace(f'{{{v}}}', f'{{{i}}}')
            format_args.append(v)
        
        return f'string.Format("{template}", {", ".join(format_args)})'

    # Match $"..." heursitically
    new_content = re.sub(r'\$"(.*?)"', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Refactored: {filepath}")

for root, dirs, files in os.walk('./csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            refactor_interpolated(os.path.join(root, file))
