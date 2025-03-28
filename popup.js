
function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

const port = chrome.runtime.connect({ name: 'popup' });

port.onMessage.addListener((message) => {
  if (message.type === 'statsUpdated') {
    updatePopupDisplay(message.data);
  }
});

async function updatePopup() {
  try {

    const { weeklyStats, dailyStats, timeData } = await chrome.storage.local.get(['weeklyStats', 'dailyStats', 'timeData']);
    const today = new Date().toISOString().split('T')[0];
    const todayStats = dailyStats[today] || { productive: 0, unproductive: 0, neutral: 0 };
    
    updatePopupDisplay({
      dailyStats: todayStats,
      weeklyStats,
      timeData
    });
  } catch (error) {
    console.error('Error updating popup:', error);
  }
}

function updatePopupDisplay(data) {
  const { dailyStats, weeklyStats, timeData } = data;
 
  document.getElementById('productiveTime').textContent = formatTime(dailyStats.productive);
  document.getElementById('unproductiveTime').textContent = formatTime(dailyStats.unproductive);
  document.getElementById('neutralTime').textContent = formatTime(dailyStats.neutral);
  
  const weeklyTotal = weeklyStats.productive + weeklyStats.unproductive + weeklyStats.neutral;
  const weeklyScore = weeklyTotal > 0 ? Math.round((weeklyStats.productive / weeklyTotal) * 100) : 0;
  document.getElementById('productivityScore').textContent = `${weeklyScore}%`;

  const topSitesContainer = document.getElementById('topSites');
  topSitesContainer.innerHTML = '';

  const sortedSites = Object.entries(timeData)
    .sort(([, a], [, b]) => b.totalTime - a.totalTime)
    .slice(0, 5);
  
  sortedSites.forEach(([domain, data]) => {
    const siteElement = document.createElement('div');
    siteElement.className = 'flex justify-between items-center p-2 bg-gray-50 rounded';
    
    const domainElement = document.createElement('div');
    domainElement.className = 'text-sm font-medium text-gray-800';
    domainElement.textContent = domain;
    
    const timeElement = document.createElement('div');
    timeElement.className = `text-sm font-medium ${
      data.category === 'productive' ? 'text-green-600' :
      data.category === 'unproductive' ? 'text-red-600' :
      'text-blue-600'
    }`;
    timeElement.textContent = formatTime(data.totalTime);
    
    siteElement.appendChild(domainElement);
    siteElement.appendChild(timeElement);
    topSitesContainer.appendChild(siteElement);
  });
}

document.addEventListener('DOMContentLoaded', updatePopup);

setInterval(updatePopup, 5000); 