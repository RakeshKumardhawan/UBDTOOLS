import re

with open('src/components/SystemPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("log.timestamp.split(' ')[1]", "(log.timestamp.split(' ')[1] || log.timestamp)")

with open('src/components/SystemPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
