with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    lines = f.readlines()

depth = 0
for i, line in enumerate(lines):
    for char in line:
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
    if depth == 0 and i > 15 and i < len(lines) - 5:
        if line.strip() != "" and line.strip() != "}":
            print(f"Depth 0 at line {i+1}: {line.strip()}")
