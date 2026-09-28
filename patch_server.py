with open("server.ts", "r") as f:
    content = f.read()

# Add isOnline properties to the remoteQueueStore initialization
content = content.replace(
    "queueNumber: 1",
    "queueNumber: 1,\n      isOnline: true"
)
content = content.replace(
    "queueNumber: 2",
    "queueNumber: 2,\n      isOnline: false"
)
content = content.replace(
    "queueNumber: remoteQueueStore.filter(q => q.queueStatus === 'waiting').length + 1",
    "queueNumber: remoteQueueStore.filter(q => q.queueStatus === 'waiting' && q.isOnline !== false).length + 1,\n      isOnline: true"
)

with open("server.ts", "w") as f:
    f.write(content)
print("Patched server.ts")
