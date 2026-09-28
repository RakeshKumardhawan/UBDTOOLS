unzip -q public/EVedhikaUBDDeploymentTool_CSharp_Solution.zip -d /tmp/test_sln
cd /tmp/test_sln
mcs -target:library -recurse:'*.cs' -out:temp.dll || true
rm -rf /tmp/test_sln
