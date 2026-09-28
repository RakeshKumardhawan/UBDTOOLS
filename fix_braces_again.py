import os

def count_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    open_count = 0
    close_count = 0
    
    in_string = False
    in_char = False
    escape = False

    for char in content:
        if escape:
            escape = False
            continue
            
        if char == '\\':
            escape = True
            continue
            
        if char == '"' and not in_char:
            in_string = not in_string
            continue
            
        if char == "'" and not in_string:
            in_char = not in_char
            continue
            
        if not in_string and not in_char:
            if char == '{':
                open_count += 1
            elif char == '}':
                close_count += 1
                
    return open_count, close_count

for root, dirs, files in os.walk('csharp_solution/EVedhikaUBDDeploymentTool'):
    for file in files:
        if file.endswith('.cs'):
            filepath = os.path.join(root, file)
            opens, closes = count_braces(filepath)
            if opens != closes:
                print(f"Mismatch in {file}: {opens} opens, {closes} closes")

