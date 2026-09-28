import os
import re

def scan_features(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # regex for string interpolation $"..."
    interpolation_re = re.compile(r'\$"(.*?)"')
    # regex for null-conditional operator ?.
    null_cond_re = re.compile(r'\?\.')
    # regex for null-conditional operator ?[
    null_index_re = re.compile(r'\?\[')
    # regex for pattern matching "is Type name"
    pattern_match_re = re.compile(r'\bis\s+[A-Z][a-zA-Z0-9_.]+\s+[a-z][a-zA-Z0-9_]+\b')
    # regex for tuples (Type name, Type name)
    tuple_re = re.compile(r'\(\s*[A-Z][a-zA-Z0-9_.]+\s+[a-z][a-zA-Z0-9_]+\s*,\s*')

    for i, line in enumerate(lines):
        clean_line = line.split('//')[0].strip() # ignore comments
        
        if interpolation_re.search(clean_line):
            print(f"C# 6.0 Interpolation: {filepath}:{i+1}: {line.strip()}")
        if null_cond_re.search(clean_line) or null_index_re.search(clean_line):
            print(f"C# 6.0 Null-Conditional: {filepath}:{i+1}: {line.strip()}")
        if pattern_match_re.search(clean_line):
            print(f"C# 7.0 Pattern Matching: {filepath}:{i+1}: {line.strip()}")
        if tuple_re.search(clean_line):
            print(f"C# 7.0 Tuple: {filepath}:{i+1}: {line.strip()}")
        if '=>' in clean_line and '=>' not in line.split('"')[0]: # rough check for lambdas
             print(f"C# 3.0+ Lambda/Expression Body: {filepath}:{i+1}: {line.strip()}")

base_path = '/csharp_solution/EVedhikaUBDDeploymentTool'
print(f"Scanning base_path: {base_path}")
for root, dirs, files in os.walk(base_path):
    for f in files:
        if f.endswith('.cs'):
            full_path = os.path.join(root, f)
            print(f"Scanning: {full_path}")
            scan_features(full_path)
