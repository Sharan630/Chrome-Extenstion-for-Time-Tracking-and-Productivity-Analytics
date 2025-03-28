# Chrome-Extenstion-for-Time-Tracking-and-Productivity-Analytics

COMPANY : CODETECH IT SOLUTIONS

NAME : Bhogi Sharan Sai

INETRN ID : CT6WUIN

DOMAIN : Full Stack Web Development

DURATION : 6 WEEKS

MENTOR : NEELA SANTOSH

A Chrome extension that tracks your browsing time and boosts productivity. Get real-time insights into your online activities with smart website categorization, daily stats, and weekly reports. All data stays private with local storage only.

## 📊 Key Features

### Real-Time Tracking
- Automatic time tracking for each website you visit
- Instant updates when switching between tabs
- Background tracking even when the popup is closed
- Accurate timing with tab and window focus detection

### Smart Website Categories
```javascript
Productive Sites:
- github.com
- stackoverflow.com
- leetcode.com
- codecademy.com
- udemy.com
- coursera.org
- docs.google.com
- jira.com
- trello.com

Unproductive Sites:
- facebook.com
- instagram.com
- twitter.com
- tiktok.com
- reddit.com
- youtube.com
```

### Analytics Dashboard
- Today's Overview with time spent in each category
- Weekly productivity score
- Top visited sites with time breakdown
- Color-coded time categories (Productive 🟢, Unproductive 🔴, Neutral ⚪)

## 🛠️ Technical Implementation

### Core Components
1. **Background Script** (`background.js`)
   - Handles real-time time tracking
   - Manages website categorization
   - Stores and updates statistics
   - Handles browser events (tab switches, window focus)

2. **Popup Interface** (`popup.html`, `popup.js`)
   - Displays current statistics
   - Shows time distribution
   - Lists top visited sites
   - Updates in real-time

3. **Data Management**
   - Local storage for all data
   - Daily stats reset at midnight
   - Weekly report generation
   - Persistent data across sessions

### Chrome APIs Used
- `chrome.tabs`: Tab tracking and URL detection
- `chrome.storage`: Local data persistence
- `chrome.runtime`: Message passing and background processing
- `chrome.alarms`: Scheduled tasks (weekly reports)

### Reading the Dashboard
- **Today's Overview**: Shows time spent in each category
- **Weekly Score**: Overall productivity percentage
- **Top Sites**: Most visited websites with time spent

### Privacy
- All data stored locally on your device
- No external servers or data collection
- Complete control over your data

<p align="center">Built for better productivity and time management</p>
