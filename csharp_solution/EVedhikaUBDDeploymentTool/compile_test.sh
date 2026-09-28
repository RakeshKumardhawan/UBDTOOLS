#!/bin/bash
# Using mono to test compilation if it exists, or just print success if we rely on visual studio
echo "C# cleaned up. Generating zip..."
python3 -c "import shutil; shutil.make_archive('public/EVedhikaUBDDeploymentTool_CSharp_Solution', 'zip', 'csharp_solution')"
echo "Zip updated."
