
const productiveDomains = [
  'www.github.com',
  'www.stackoverflow.com',
  'www.leetcode.com',
  'www.codecademy.com',
  'www.udemy.com',
  'www.coursera.org',
  'www.docs.google.com',
  'www.jira.com',
  'www.linkedin.com'
];

const unproductiveDomains = [
  'www.facebook.com',
  'www.instagram.com',
  'www.twitter.com',
  'www.tiktok.com',
  'www.primevideo.com',
  'www.netflix.com',
  'www.youtube.com' 
];

chrome.runtime.onInstalled.addListener(() => {
  const today = new Date().toISOString().split('T')[0];
  chrome.storage.local.set({
    timeData: {},
    weeklyStats: {
      productive: 0,
      unproductive: 0,
      neutral: 0
    },
    dailyStats: {
      [today]: {
        productive: 0,
        unproductive: 0,
        neutral: 0
      }
    }
  });
});

let startTime = Date.now();
let currentTabId = null;
let isTracking = true;
let popupPort = null;
let lastUpdateTime = Date.now();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    popupPort = port;
    port.onDisconnect.addListener(() => {
      popupPort = null;
    });
  }
});

async function checkAndResetDailyStats() {
  const today = new Date().toISOString().split('T')[0];
  const { dailyStats } = await chrome.storage.local.get('dailyStats');
  
  if (!dailyStats[today]) {
    dailyStats[today] = {
      productive: 0,
      unproductive: 0,
      neutral: 0
    };
    await chrome.storage.local.set({ dailyStats });
  }
  return dailyStats[today];
}

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isTracking = false;
    if (currentTabId) {
      await updateTimeSpent(currentTabId);
    }
  } else {
    isTracking = true;
    startTime = Date.now();
    lastUpdateTime = Date.now();
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (currentTabId && currentTabId !== activeInfo.tabId) {
    await updateTimeSpent(currentTabId);
  }
  currentTabId = activeInfo.tabId;
  startTime = Date.now();
  lastUpdateTime = Date.now();
  await checkAndResetDailyStats();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    await updateTimeSpent(tabId);
    startTime = Date.now();
    lastUpdateTime = Date.now();
    await checkAndResetDailyStats();
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === currentTabId) {
    await updateTimeSpent(tabId);
    currentTabId = null;
  }
});

setInterval(async () => {
  if (isTracking && currentTabId) {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;
  
    if (timeSinceLastUpdate >= 1000) {
      await updateTimeSpent(currentTabId);
      lastUpdateTime = now;
    }
  }
}, 1000);

async function updateTimeSpent(tabId) {
  try {
    if (!isTracking) return;
    
    const tab = await chrome.tabs.get(tabId);
    if (!tab?.url) return;
    
    const url = new URL(tab.url);
    const domain = url.hostname.toLowerCase();
    
    const now = Date.now();
    const timeSpent = Math.max(0, now - startTime);
    startTime = now;
    
    if (timeSpent === 0) return;
    
    const category = classifyWebsite(domain);
    
    const { timeData } = await chrome.storage.local.get('timeData');
    if (!timeData[domain]) {
      timeData[domain] = {
        totalTime: 0,
        category,
        visits: 0
      };
    }
    
    timeData[domain].totalTime += timeSpent;
    timeData[domain].visits += 1;

    const today = new Date().toISOString().split('T')[0];
    const { dailyStats } = await chrome.storage.local.get('dailyStats');
    
    if (!dailyStats[today]) {
      dailyStats[today] = {
        productive: 0,
        unproductive: 0,
        neutral: 0
      };
    }
    
    dailyStats[today][category] += timeSpent;  

    const { weeklyStats } = await chrome.storage.local.get('weeklyStats');
    weeklyStats[category] += timeSpent;
 
    await chrome.storage.local.set({
      timeData,
      dailyStats,
      weeklyStats
    });

    if (popupPort) {
      popupPort.postMessage({
        type: 'statsUpdated',
        data: {
          dailyStats: dailyStats[today],
          weeklyStats,
          timeData
        }
      });
    }
  } catch (error) {
    console.error('Error updating time spent:', error);
  }
}

function classifyWebsite(domain) {
  domain = domain.toLowerCase();
  if (productiveDomains.some(d => domain.includes(d))) {
    return 'productive';
  } else if (unproductiveDomains.some(d => domain.includes(d))) {
    return 'unproductive';
  }
  return 'neutral';
}

chrome.alarms.create('weeklyReport', { periodInMinutes: 10080 }); // 7 days

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'weeklyReport') {
    const { weeklyStats } = await chrome.storage.local.get('weeklyStats');
    const totalTime = weeklyStats.productive + weeklyStats.unproductive + weeklyStats.neutral;
    const productivityScore = (weeklyStats.productive / totalTime) * 100;
    
    await chrome.storage.local.set({
      weeklyStats: {
        productive: 0,
        unproductive: 0,
        neutral: 0
      }
    });

    const reports = await chrome.storage.local.get('reports') || { reports: [] };
    reports.reports.push({
      date: new Date().toISOString(),
      stats: weeklyStats,
      productivityScore
    });
    await chrome.storage.local.set({ reports });
  }
}); 