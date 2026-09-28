import os

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    open_braces = content.count('{')
    close_braces = content.count('}')
    
    if open_braces != close_braces:
        print(f"FILE: {filepath} -> Braces mismatch: {{={open_braces}, }}={close_braces}")
    
    # Check for 'catch' at start of line (possibly misplaced)
    lines = content.split('\n')
    for i, line in enumerate(lines):
        trimmed = line.strip()
        if trimmed.startswith('catch') and not line.startswith(' ' * 12): # Heuristic: catch blocks should be deeply nested
             # This is just a heuristic, but catch at class level (usually 4 or 8 spaces) is suspicious.
             if len(line) - len(line.lstrip()) < 8:
                 print(f"FILE: {filepath} LINE {i+1} -> Suspicious 'catch' indentation: '{line}'")

for root, dirs, files in os.walk('./csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            check_file(os.path.join(root, file))
