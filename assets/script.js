document.getElementById('enqueue-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const enqueueResultElement = document.getElementById('enqueue-result');
  enqueueResultElement.innerHTML = "Enqueuing...";

  const q = document.getElementById('enqueue-input').value;
  const crawlName = document.getElementById('crawl-name').value;

  fetch('/enqueue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ links: [q], crawlName: crawlName })
  })
  .then(response => response.json())
  .then(data => {
    enqueueResultElement.innerHTML = JSON.stringify(data, null, 2);
    if (data.crawlId) {
      startLogStream(data.crawlId);
    }
    hljs.highlightAll();
  })
  .catch(error => {
    enqueueResultElement.innerHTML = '<p>An error occurred</p>';
  });
});

document.getElementById('search-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const resultsElement = document.getElementById('results');
  resultsElement.innerHTML = "Searching...";

  const q = document.getElementById('search-query').value;
  fetch('/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q })
  })
  .then(response => response.json())
  .then(data => {
    let results = '<ul>';
    data.results.forEach(item => {
      results += `<li><a href="${item.href}" target="_blank">${item.title}</a></li>`;
    });
    results += '</ul>';
    resultsElement.innerHTML = results;
    document.getElementById('total-results').innerHTML = `Total results: ${data.totalResults}`;
  })
  .catch(error => {
    resultsElement.innerHTML = '<p>An error occurred</p>';
  });
});

function startLogStream(crawlId) {
  const eventSource = new EventSource(`/logs/stream/${crawlId}`);
  const logContainer = document.getElementById('log-container');
  logContainer.innerHTML = '';

  eventSource.onmessage = function(event) {
    const log = JSON.parse(event.data);
    const logMessage = document.createElement('p');
    logMessage.textContent = `${log.timestamp} - ${log.level.toUpperCase()}: ${log.message}`;
    logContainer.appendChild(logMessage);
    logContainer.scrollTop = logContainer.scrollHeight;
  };

  eventSource.onerror = function() {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'An error occurred with the log stream.';
    logContainer.appendChild(errorMessage);
    eventSource.close();
  };
}

// Optional: Stop log stream when leaving the page
window.addEventListener('beforeunload', function() {
  if (eventSource) {
    eventSource.close();
  }
});

// Tab functionality
document.getElementById('search-tab-btn').addEventListener('click', function() {
  showTab('search-tab');
});

document.getElementById('enqueue-tab-btn').addEventListener('click', function() {
  showTab('enqueue-tab');
});

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
  
  document.querySelectorAll('.tab-buttons div').forEach(tabBtn => {
    tabBtn.classList.remove('active');
  });
  document.getElementById(`${tabId}-btn`).classList.add('active');
}