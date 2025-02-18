document.addEventListener('DOMContentLoaded', () => {
  const adversaryList = document.getElementById('adversary-list');
  const adversarySearch = document.getElementById('adversary-search');

  let adversaries = [];

  // Load adversaries from adversaries.json
  async function loadAdversaries() {
    try {
      const response = await fetch('data/adversaries.json');
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      // Ensure we're only using the "creatures" list
      if (!Array.isArray(data.creatures)) {
        throw new Error('Adversaries data is not an array');
      }

      adversaries = data.creatures;
      displayAdversaries();
    } catch (error) {
      console.error('Error loading adversaries:', error);
    }
  }

  // Function to display adversaries in a table with a fixed height
  function displayAdversaries(filter = '') {
    adversaryList.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-bordered');

    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>CR</th>
                <th>XP</th>
                <th>Action</th>
            </tr>
        `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    adversaries
      .filter((adversary) =>
        adversary.name.toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((adversary) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${adversary.name}</td>
                    <td>${adversary.cr}</td>
                    <td>${adversary.xp}</td>
                    <td>
                        <button class="btn btn-primary btn-sm add-adversary" data-name="${adversary.name}">
                            Add
                        </button>
                    </td>
                `;
        tbody.appendChild(row);
      });

    table.appendChild(tbody);
    adversaryList.appendChild(table);
  }

  // Search functionality for adversaries
  adversarySearch.addEventListener('input', (event) => {
    displayAdversaries(event.target.value);
  });

  // Limit height of the adversary panel and make it scrollable
  adversaryList.style.maxHeight = '400px';
  adversaryList.style.overflowY = 'auto';

  // Load adversaries automatically on page load
  loadAdversaries();
});
