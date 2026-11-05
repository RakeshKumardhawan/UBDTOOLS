import re

with open('server.ts', 'r') as f:
    text = f.read()

# Add ANNOUNCEMENTS_FILE_PATH and persistent store helpers around line 260
announcement_store_code = '''
  const ANNOUNCEMENTS_FILE_PATH = path.join(process.cwd(), 'announcements.json');
  let liveAnnouncements: any[] = [
    {
      id: 1,
      title: 'IMPORTANT: v1.0.7 Update Released',
      content: 'Brand new v1.0.7 release with Direct Telegram & Cloud Telemetry, immediate installation reporting, zero-manual auto-repair, and full Windows 7/8/10/11 compatibility.',
      date: '2026-10-13',
      importance: 'High',
      category: 'Software Update',
      author: 'Rakesh Dhawan (Admin)'
    },
    {
      id: 2,
      title: 'UBD Portal Security Guidelines',
      content: 'Ensure Edge IE Mode and Zone 2 Trusted Sites are configured before signing documents with USB DSC Token.',
      date: '2026-10-04',
      importance: 'Normal',
      category: 'Portal Notice',
      author: 'E-Vedhika Admin'
    }
  ];

  try {
    if (fs.existsSync(ANNOUNCEMENTS_FILE_PATH)) {
      const savedAnn = JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE_PATH, 'utf8'));
      if (Array.isArray(savedAnn) && savedAnn.length > 0) {
        liveAnnouncements = savedAnn;
      }
    } else {
      fs.writeFileSync(ANNOUNCEMENTS_FILE_PATH, JSON.stringify(liveAnnouncements, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error reading announcements.json:', e);
  }

  const saveAnnouncements = () => {
    try {
      fs.writeFileSync(ANNOUNCEMENTS_FILE_PATH, JSON.stringify(liveAnnouncements, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving announcements.json:', e);
    }
  };
'''

# Replace old in-memory liveAnnouncements definition
text = re.sub(r'const liveAnnouncements = \[.*?\];', announcement_store_code, text, flags=re.DOTALL)

# Add API routes for Announcements (/api/announcements, POST, DELETE)
announcement_routes = '''
  // API Route: Get all live announcements/posts
  app.get('/api/announcements', (req, res) => {
    return res.json({
      success: true,
      announcements: liveAnnouncements,
      count: liveAnnouncements.length
    });
  });

  // API Route: Publish new announcement/post (Web & C# App Live Sync)
  app.post('/api/announcements', async (req, res) => {
    try {
      const { title, content, importance, category, date, author, sendTelegram } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, error: 'Title and content are required.' });
      }

      const newPost = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        importance: importance || 'High',
        category: category || 'General Announcement',
        date: date || new Date().toISOString().slice(0, 10),
        author: author || 'Rakesh Dhawan (Admin)'
      };

      liveAnnouncements.unshift(newPost);
      saveAnnouncements();

      // Send auto-Telegram notification if requested and configured
      if (sendTelegram !== false && telegramConfig.botToken && telegramConfig.chatId) {
        const tgMsg = `📢 <b>NEW LIVE ANNOUNCEMENT PUBLISHED</b>\\n\\n` +
          `<b>Title:</b> ${newPost.title}\\n` +
          `<b>Category:</b> ${newPost.category}\\n` +
          `<b>Priority:</b> ${newPost.importance}\\n` +
          `<b>Date:</b> ${newPost.date}\\n\\n` +
          `<b>Details:</b>\\n${newPost.content}\\n\\n` +
          `<i>Direct Link: https://www.e-vedhika.in/admin/post</i>`;
        sendTelegramMessage(tgMsg);
      }

      return res.json({
        success: true,
        message: 'Post published successfully and saved to announcements.json!',
        post: newPost
      });
    } catch (err: any) {
      console.error('Error publishing announcement:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Delete announcement/post
  app.delete('/api/announcements/:id', (req, res) => {
    try {
      const idParam = req.params.id;
      liveAnnouncements = liveAnnouncements.filter(a => String(a.id) !== String(idParam));
      saveAnnouncements();
      return res.json({ success: true, message: 'Announcement deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // API Route: Live News & Announcements for C# Application
  app.get('/api/news', (req, res) => {
    return res.json({
      success: true,
      news: liveAnnouncements
    });
  });
'''

# Replace old app.get('/api/news', ...)
text = re.sub(r'// API Route: Live News & Announcements for C# Application.*?\}\);\n  \}\);', announcement_routes, text, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(text)

print('server.ts updated with persistent announcements store and API endpoints!')
