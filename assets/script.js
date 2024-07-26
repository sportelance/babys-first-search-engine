  document.getElementById('enqueue-form').addEventListener('submit', function(event) {
        event.preventDefault();
        document.getElementById('enqueue-result').innerHTML = "Enqueuing...";
        console.log('enqueue');
        const q = document.getElementById('enqueue-input').value;
        const crawlName = document.getElementById('crawl-name').value;
        fetch('/enqueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ links: [q], crawlName: crawlName})
        })
        .then(response => response.json())
        .then(data => {
          document.getElementById('enqueue-result').innerHTML = JSON.stringify(data, null, 2);
        })
        .catch(error => {
          document.getElementById('enqueue-result').innerHTML = '<p>An error occurred</p>';
        });
      });

      document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        document.getElementById('results').innerHTML = "Searching...";
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
          data.forEach(item => {
            results += '<li><a href="' + item.href + '">' + item.title + '</a></li>';
          });
          results += '</ul>';
          document.getElementById('results').innerHTML = results;
        })
        .catch(error => {
          document.getElementById('results').innerHTML = '<p>An error occurred</p>';
        });
      });