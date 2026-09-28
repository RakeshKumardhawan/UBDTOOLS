import re

with open("src/components/BackupsView.tsx", "r") as f:
    content = f.read()

# Replace uses of remoteQueue for rendering and counting with liveRemoteQueue
content = content.replace(
    "{remoteQueue.filter(q => q.queueStatus === 'waiting').length > 0 && (",
    "{remoteQueue.filter(q => q.queueStatus === 'waiting' && q.isOnline !== false).length > 0 && ("
)
content = content.replace(
    "{remoteQueue.filter(q => q.queueStatus === 'waiting').length}",
    "{remoteQueue.filter(q => q.queueStatus === 'waiting' && q.isOnline !== false).length}"
)
content = content.replace(
    "queueNumber: remoteQueue.filter(q => q.queueStatus === 'waiting').length + 1",
    "queueNumber: remoteQueue.filter(q => q.queueStatus === 'waiting' && q.isOnline !== false).length + 1,\n                    isOnline: true"
)
content = content.replace(
    "{remoteQueue.map((item) => (",
    "{remoteQueue.filter(item => item.isOnline !== false).map((item) => ("
)

with open("src/components/BackupsView.tsx", "w") as f:
    f.write(content)
print("Patched BackupsView.tsx")
