import os

def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple state machine to ignore braces in comments and strings
    in_string = False
    in_char = False
    in_line_comment = False
    in_block_comment = False
    escape = False
    
    depth = 0
    line_no = 1
    col_no = 0
    
    for i, char in enumerate(content):
        if char == '\n':
            line_no += 1
            col_no = 0
            in_line_comment = False
        else:
            col_no += 1

        if escape:
            escape = False
            continue

        if in_line_comment:
            continue
        if in_block_comment:
            if char == '*' and i + 1 < len(content) and content[i+1] == '/':
                in_block_comment = False
                # We skip the next '/' in the loop by looking ahead if we were doing manual indexing, 
                # but here we just continue and the next char will be processed normally.
            continue
        
        if in_string:
            if char == '\\':
                escape = True
            elif char == '"':
                in_string = False
            continue
            
        if in_char:
            if char == '\\':
                escape = True
            elif char == '\'':
                in_char = False
            continue

        if char == '/' and i + 1 < len(content):
            if content[i+1] == '/':
                in_line_comment = True
                continue
            if content[i+1] == '*':
                in_block_comment = True
                continue
        
        if char == '"':
            in_string = True
            continue
        if char == '\'':
            in_char = True
            continue
            
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth < 0:
                print(f"ERROR: Extra closing brace at {filepath}:{line_no}:{col_no}")
                # Reset depth to 0 to keep searching for more errors
                depth = 0
                
    if depth > 0:
        print(f"ERROR: Missing {depth} closing braces in {filepath}")
    elif depth < 0:
        # This shouldn't happen with the logic above resetting it
        pass
    else:
        print(f"SUCCESS: {filepath} braces are balanced")

files_to_check = [
    'MainForm.cs',
    'MainForm.Designer.cs',
    'Program.cs',
    'Engine/AutoUpdateEngine.cs',
    'Engine/ProactiveHealthEngine.cs',
    'Helpers/NativeRemoteAgent.cs',
    'Helpers/Logger.cs'
]

base_path = '/csharp_solution/EVedhikaUBDDeploymentTool'
for f in files_to_check:
    path = os.path.join(base_path, f)
    if os.path.exists(path):
        check_braces(path)
    else:
        print(f"File not found: {path}")
