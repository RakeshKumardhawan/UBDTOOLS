def find_negative_depth(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    depth = 0
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth < 0:
                    print(f"NEGATIVE DEPTH at {filepath}:{i+1} -> {line.strip()}")
                    return
    if depth > 0:
        print(f"POSITIVE DEPTH at end of {filepath}: {depth}")
    elif depth == 0:
        print(f"{filepath} is balanced.")

find_negative_depth('./csharp_solution/EVedhikaUBDDeploymentTool/Helpers/NativeRemoteAgent.cs')
find_negative_depth('./csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs')
