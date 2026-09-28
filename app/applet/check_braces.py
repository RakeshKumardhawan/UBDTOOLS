def find_unbalanced(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    depth = 0
    for i, line in enumerate(lines):
        opens = line.count('{')
        closes = line.count('}')
        
        new_depth = depth + opens - closes
        
        if opens > 0 or closes > 0:
            # print(f"L{i+1}: depth {depth} -> {new_depth} | {line.strip()}")
            pass
        
        depth = new_depth
    
    if depth != 0:
        print(f"FILE: {filepath} ends with depth {depth}")

find_unbalanced('./csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs')
