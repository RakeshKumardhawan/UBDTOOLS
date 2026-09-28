def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the last closing brace and remove it
    last_brace_idx = content.rfind('}')
    if last_brace_idx != -1:
        content = content[:last_brace_idx] + content[last_brace_idx+1:]
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('csharp_solution/EVedhikaUBDDeploymentTool/Helpers/NativeRemoteAgent.cs')
fix_file('csharp_solution/EVedhikaUBDDeploymentTool/Engine/AutoUpdateEngine.cs')
print("Fixed NativeRemoteAgent.cs and AutoUpdateEngine.cs")
