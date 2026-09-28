import re

with open('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's count properly and find the exact mismatch
# We will just rewrite the file by checking its structure.

# Let's check the bottom of the file
lines = content.split('\n')
print(f"Total lines: {len(lines)}")
for i in range(len(lines)-20, len(lines)):
    print(f"{i+1}: {lines[i]}")

