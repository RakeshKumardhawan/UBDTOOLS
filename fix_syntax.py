import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace simple SafeInvoke(() => { ... });
    # This is complex with regex but let's try the most common ones
    
    # 1. SafeInvoke(() => {
    content = content.replace("SafeInvoke(() => {", "SafeInvoke(delegate() {")
    
    # 2. SafeInvoke(() =>
    content = content.replace("SafeInvoke(() =>", "SafeInvoke(delegate() {")
    # Need to find the end of the statement and add } if we replaced ( ) => something
    # This is hard. Let's do manual multi_edit for complex ones.
    
    # 3. ThreadPool.QueueUserWorkItem((state) =>
    content = content.replace("ThreadPool.QueueUserWorkItem((state) =>", "ThreadPool.QueueUserWorkItem(delegate(object state)")
    
    # 4. issuesFound = AutoRepairEngine.PerformSelfHealingAudit((msg) =>
    content = content.replace("issuesFound = AutoRepairEngine.PerformSelfHealingAudit((msg) =>", "issuesFound = AutoRepairEngine.PerformSelfHealingAudit(delegate(string msg)")

    # 5. (msg) => LogMessage
    content = content.replace("(msg) => LogMessage", "delegate(string msg) { LogMessage")
    # This might need a closing brace later... this is why manual is better.

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Actually, I'll stick to multi_edit_file to be safe.
