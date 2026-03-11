# How to Test the Timeline Feature

## Step 1: Open Your Extension
1. Open Chrome
2. Click on the StandupNOW extension icon
3. Press `F12` to open Developer Tools
4. Go to the "Console" tab

## Step 2: Paste This Code in the Console

```javascript
// Add test entries with different time gaps
const now = new Date();
const entries = [
  {
    id: Date.now() + 1,
    content: "Most recent entry",
    timestamp: now.toISOString()
  },
  {
    id: Date.now() + 2,
    content: "Entry from 5 minutes ago",
    timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
  },
  {
    id: Date.now() + 3,
    content: "Entry from 1 hour 30 minutes ago",
    timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString()
  },
  {
    id: Date.now() + 4,
    content: "Entry from 3 hours 45 minutes ago",
    timestamp: new Date(now.getTime() - 225 * 60 * 1000).toISOString()
  }
];

localStorage.setItem('standupEntries', JSON.stringify(entries));
location.reload();
```

## Step 3: See the Timeline!

After the page reloads, you should see:
- **+5m** between the most recent entry and 5 minutes ago
- **+1h25m** between 5 minutes ago and 1h30m ago  
- **+2h15m** between 1h30m ago and 3h45m ago

The timeline connectors will appear as:
- A subtle vertical line
- A gray time badge showing "+Xm" or "+XhYm"

---

## If You Still Don't See It

Make sure you've reloaded the extension:
1. Go to `chrome://extensions/`
2. Find "StandupNOW"
3. Click the **RELOAD** button (circular arrow)
4. Try the steps above again

The timeline feature is in the code and working - it just needs entries with time gaps to display!