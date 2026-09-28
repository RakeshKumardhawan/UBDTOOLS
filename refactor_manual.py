import os
import re

def refactor_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace interpolated strings $"...{var}..." with string.Format("...{0}...", var)
    # This is complex for nested braces, but let's try a simple version first.
    # We'll just replace the $ for now if there are no braces, or do it more carefully.
    
    def replace_interpolation(match):
        inner = match.group(1)
        # Find all {var} in inner
        parts = re.split(r'(\{.*?\})', inner)
        fmt_str = ""
        args = []
        arg_idx = 0
        for part in parts:
            if part.startswith('{') and part.endswith('}'):
                fmt_str += "{" + str(arg_idx) + "}"
                args.append(part[1:-1])
                arg_idx += 1
            else:
                fmt_str += part.replace('{', '{{').replace('}', '}}')
        
        if not args:
            return f'"{fmt_str}"'
        return f'string.Format("{fmt_str}", {", ".join(args)})'

    # Handle $"..." and $@"..."
    # Simplified regex for non-nested braces
    content = re.sub(r'\$"(.*?)"', replace_interpolation, content)
    content = re.sub(r'\$@"(.*?)"', replace_interpolation, content) # This might need more care for verbatim

    # 2. Replace null-conditional ?. and ?[
    # This is also complex. Let's do a simple replacement for the most common cases.
    # obj?.Prop -> (obj != null ? obj.Prop : null)
    # This is hard to do with regex perfectly.
    
    # 3. Replace null-coalescing assignment ??= (C# 8.0) if any
    content = re.sub(r'(\w+)\s*\?\?=\s*(.*?);', r'if (\1 == null) \1 = \2;', content)

    # 4. Replace pattern matching "is Type var" (C# 7.0)
    # handled by the previous assistant already? Let's check.
    
    # 5. Remove onComplete?.Invoke(...)
    # Actually, let's just do it manually for the files I know.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_path = '/csharp_solution/EVedhikaUBDDeploymentTool'
# I'll manually refactor the known files instead of a buggy regex.
