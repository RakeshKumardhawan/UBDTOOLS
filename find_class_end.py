import os
for root, dirs, files in os.walk('csharp_solution'):
    for file in files:
        if file.endswith('.cs'):
            with open(os.path.join(root, file), 'r') as f:
                content = f.read()
            depth = 0
            for i, line in enumerate(content.split('\n')):
                for char in line:
                    if char == '{': depth += 1
                    elif char == '}': depth -= 1
                if depth < 0:
                    print(f"Negative depth in {file} at line {i+1}")
