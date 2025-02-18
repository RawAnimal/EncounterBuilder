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

  // Function to display adversaries in a scrollable list
  function displayAdversaries(filter = '') {
    adversaryList.innerHTML = '';
    adversaries
      .filter((adversary) =>
        adversary.name.toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((adversary) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-group-item');
        listItem.textContent = `${adversary.name} (CR ${adversary.cr})`;
        adversaryList.appendChild(listItem);
      });
  }

  // Search functionality for adversaries
  adversarySearch.addEventListener('input', (event) => {
    displayAdversaries(event.target.value);
  });

  // Load adversaries automatically on page load
  loadAdversaries();
});
