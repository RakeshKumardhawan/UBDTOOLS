#!/bin/bash
# Build with warning suppression if dotnet CLI is present, then regenerate solution zip
if command -v dotnet >/dev/null 2>&1; then
  dotnet build csharp_solution/EVedhikaUBDDeploymentTool/EVedhikaUBDDeploymentTool.csproj -c Release /p:TreatWarningsAsErrors=false /p:WarningLevel=0 /clp:ErrorsOnly
fi
echo "C# cleaned up. Generating zip..."
py -3 -c "import shutil; shutil.make_archive('public/EVedhikaUBDDeploymentTool_CSharp_Solution', 'zip', 'csharp_solution')"
echo "Zip updated."
