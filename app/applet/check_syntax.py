import os
import re

def check_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    content = "".join(lines)
    
    # Check for unmatched braces
    open_b = content.count('{')
    close_b = content.count('}')
    if open_b != close_b:
        print(f"ERROR: Unmatched braces in {filepath}: {open_b} vs {close_b}")

    # Check for catch without try (basic check)
    catches = content.count('catch')
    tries = content.count('try')
    # This is a bit naive but if tries < catches it might be an issue (unless try has multiple catches)
    
    # Check for code outside namespace/class at the end
    # We expect the file to end with } (ignoring whitespace)
    stripped = content.strip()
    if stripped and not stripped.endswith('}'):
        if not filepath.endswith('.csproj') and not filepath.endswith('.config') and not filepath.endswith('.manifest'):
             print(f"WARNING: File {filepath} does not end with '}}'. Last chars: '{stripped[-10:]}'")

    # Check for common mistakes in MainForm.cs
    if "MainForm.cs" in filepath:
        # Check if we have any "catch" outside a method
        # This is hard to check with regex but let's try
        pass

root_dir = '/app/applet/csharp_solution/EVedhikaUBDDeploymentTool'
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.cs'):
            check_file(os.path.join(root, file))
