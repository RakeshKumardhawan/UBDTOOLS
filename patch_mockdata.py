with open('src/data/mockData.ts', 'r') as f:
    content = f.read()

logs_start = "export const initialLogs: LogEntry[] = ["
logs_to_insert = """export const initialLogs: LogEntry[] = [
  {
    id: 'LOG-006',
    timestamp: '09:55:12 AM',
    user: 'SYSTEM',
    pcName: 'CENTRAL-SERVER',
    module: 'OTA Broadcast',
    message: 'Successfully received push command: [UPDATE_AVAILABLE] v1.7.0. Scheduled silent download.',
    type: 'success'
  },
  {
    id: 'LOG-007',
    timestamp: '09:56:01 AM',
    user: 'SYSTEM',
    pcName: 'CENTRAL-SERVER',
    module: 'OTA Broadcast',
    message: 'Verifying OTA Gateway heartbeat on port 443... connection stable.',
    type: 'info'
  },"""

content = content.replace(logs_start, logs_to_insert)

with open('src/data/mockData.ts', 'w') as f:
    f.write(content)
print("mockData.ts patched.")
