import os
import re

def refactor_interpolated_bulk(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # regex to find $" ... "
    # We use a non-greedy match for the content inside quotes
    # and handle common cases of {var} or {var:format}
    def replacer(match):
        s = match.group(1)
        # Find all {var} patterns
        # Use a lazy match to avoid matching across multiple placeholders
        vars = re.findall(r'\{(.*?)\}', s)
        if not vars:
            return f'"{s}"'
        
        template = s
        format_args = []
        for i, v in enumerate(vars):
            # Replace {v} with {i} in the template
            # Be careful with multiple identical placeholders
            template = template.replace(f'{{{v}}}', f'{{{i}}}', 1)
            format_args.append(v)
        
        return f'string.Format("{template}", {", ".join(format_args)})'

    # Match $"..." accurately
    # Handle escaped quotes \" inside the string
    pattern = r'\$"(.*?)(?<!\\)"'
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False

count = 0
for root, dirs, files in os.walk('./csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            if refactor_interpolated_bulk(os.path.join(root, file)):
                count += 1
                print(f"Refactored: {file}")
print(f"Total files refactored: {count}")
