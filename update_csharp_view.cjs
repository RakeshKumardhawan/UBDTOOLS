const fs = require('fs');
const path = require('path');

function getType(filename) {
  if (filename.endsWith('.sln')) return 'sln';
  if (filename.endsWith('.csproj')) return 'csproj';
  if (filename.endsWith('.manifest')) return 'manifest';
  if (filename.endsWith('.config')) return 'config';
  if (filename.endsWith('.md')) return 'md';
  if (filename.endsWith('.iss')) return 'iss';
  return 'cs';
}

function getId(filename) {
  return filename.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function readDirRecursive(dir, relPath = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(readDirRecursive(fullPath, path.join(relPath, file)));
    } else {
      if (file.endsWith('.dll') || file.endsWith('.exe')) return;
      const content = fs.readFileSync(fullPath, 'utf8');
      const normRel = path.join(relPath, file).replace(/\\/g, '/');
      results.push({
        id: getId(normRel),
        name: file,
        path: `csharp_solution/EVedhikaUBDDeploymentTool/${normRel}`,
        type: getType(file),
        content: content
      });
    }
  });
  return results;
}

// Read Solution file too
let allFiles = [];
if (fs.existsSync('./csharp_solution/evedhika_ubd.sln')) {
  allFiles.push({
    id: 'sln',
    name: 'evedhika_ubd.sln',
    path: 'csharp_solution/evedhika_ubd.sln',
    type: 'sln',
    content: fs.readFileSync('./csharp_solution/evedhika_ubd.sln', 'utf8')
  });
}

allFiles = allFiles.concat(readDirRecursive('./csharp_solution/EVedhikaUBDDeploymentTool'));

let reactCode = fs.readFileSync('./src/components/CSharpSolutionView.tsx', 'utf8');

let newCsharpFilesCode = 'const csharpFiles: CSharpFile[] = [\n';
allFiles.forEach((fileItem, idx) => {
  const safeContent = fileItem.content.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  newCsharpFilesCode += `  {\n    id: '${fileItem.id}',\n    name: '${fileItem.name}',\n    path: '${fileItem.path}',\n    type: '${fileItem.type}',\n    content: \`${safeContent}\`\n  }${idx < allFiles.length - 1 ? ',' : ''}\n`;
});
newCsharpFilesCode += '];';

const startIdx = reactCode.indexOf('const csharpFiles: CSharpFile[] = [');
const endIdx = reactCode.indexOf('\n];', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const updatedReactCode = reactCode.substring(0, startIdx) + newCsharpFilesCode + reactCode.substring(endIdx + 3);
  fs.writeFileSync('./src/components/CSharpSolutionView.tsx', updatedReactCode);
  console.log('Updated CSharpSolutionView.tsx successfully.');
} else {
  console.error("Could not find start/end markers for csharpFiles in CSharpSolutionView.tsx");
}
