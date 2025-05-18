let chartInstance = null;
let storeMap = {};

document.addEventListener('DOMContentLoaded', () => {
  loadStores();
  const input = document.getElementById('game-search');
  const suggestionBox = document.getElementById('suggestions');

  input.addEventListener('input', e => {
    const query = e.target.value.trim();
    suggestionBox.innerHTML = '';
    suggestionBox.style.display = 'none';

    if (query.length < 2) return;

    fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.length) return;
        suggestionBox.innerHTML = data.slice(0, 5).map(game =>
          `<li onclick="selectSuggestion('${game.external.replace(/'/g, "\\'")}')">${game.external}</li>`
        ).join('');
        suggestionBox.style.display = 'block';
      });
  });

  document.addEventListener('click', e => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.style.display = 'none';
    }
  });
});

function selectSuggestion(name) {
  document.getElementById('game-search').value = name;
  document.getElementById('suggestions').style.display = 'none';
  searchGame();
}

function loadStores() {
  fetch('https://www.cheapshark.com/api/1.0/stores')
    .then(res => res.json())
    .then(stores => {
      const select = document.getElementById('store-select');
      stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.storeID;
        option.textContent = store.storeName;
        storeMap[store.storeID] = store.storeName; 
        select.appendChild(option);
      });
    });
}

function searchGame() {
  const title = document.getElementById('game-search').value.trim();
  if (!title) return;

  fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return;

      const gameID = data[0].gameID;
      fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameID}`)
        .then(res => res.json())
        .then(game => {
          const deals = game.deals;
          showDeals(deals);
          drawChart(deals);
          saveGame(title);
        });
    });
}

function showDeals(deals) {
  const container = document.getElementById('deal-results');
  container.innerHTML = '';
  deals.forEach(deal => {
    const store = storeMap[deal.storeID] || `Store ${deal.storeID}`;
    container.innerHTML += `<p><strong>${store}:</strong> $${deal.price} (${deal.savings.toFixed(0)}%)</p>`;
  });
}

function drawChart(deals) {
  const ctx = document.getElementById('priceChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  const labels = deals.map(d => storeMap[d.storeID] || `Store ${d.storeID}`);
  const prices = deals.map(d => parseFloat(d.price));

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Price ($)',
        data: prices,
        backgroundColor: 'rgba(0,188,212,0.6)',
        borderColor: '#00bcd4',
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#ccc' },
          title: { display: true, text: 'Store', color: '#ccc' }
        },
        y: {
          ticks: { color: '#ccc' },
          title: { display: true, text: 'Price (USD)', color: '#ccc' }
        }
      }
    }
  });
}

function saveGame(title) {
  fetch('/api/save-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error('Failed to save game:', data.error);
      } else {
        console.log('Saved to Supabase:', data);
      }
    })
    .catch(err => console.error('Error saving game:', err));
}

