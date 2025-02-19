// adversaryUI.js - Handles UI rendering for adversaries

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary UI...');
  renderAdversaryList();

  // Attach event listener for filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => toggleFilter(button));
  });

  // Attach event listener for search bar
  const searchInput = document.getElementById('search-adversary');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdversaryList(searchInput.value);
    });
  }

  // Attach event listener for clear filters button
  const clearFiltersButton = document.getElementById('clear-filters');
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => clearFilters());
  }
});

// ✅ Function to toggle filter buttons and display associated filter
function toggleFilter(button) {
  const filterId = button.dataset.filter;
  const activeButton = document.querySelector('.filter-btn.active');
  const activeFilterDiv = document.querySelector('.filter-div:not(.d-none)');

  // If the clicked button is already active, deactivate it and hide its filter options
  if (button.classList.contains('active')) {
    button.classList.remove('active', 'btn-primary');
    button.classList.add('btn-secondary');
    document.getElementById(`filter-${filterId}-div`).classList.add('d-none');
    return;
  }

  // Deactivate previously active button and hide its filter
  if (activeButton) {
    activeButton.classList.remove('active', 'btn-primary');
    activeButton.classList.add('btn-secondary');
  }
  if (activeFilterDiv) activeFilterDiv.classList.add('d-none');

  // Activate the clicked button
  button.classList.add('active', 'btn-primary');
  button.classList.remove('btn-secondary');

  // Show the corresponding filter div
  document.getElementById(`filter-${filterId}-div`).classList.remove('d-none');
}

// Function to render the adversary list
function renderAdversaryList(searchQuery = '') {
  console.log('Rendering adversary list...');

  const adversaryList = document.getElementById('adversary-list');
  adversaryList.innerHTML = ''; // Clear existing content

  // Filter adversaries based on search query
  const filteredAdversaries = adversaries.filter((adv) =>
    adv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredAdversaries.length === 0) {
    adversaryList.innerHTML = '<p>No adversaries found.</p>';
    return;
  }

  // Create Bootstrap table
  const table = document.createElement('table');
  table.className = 'table table-striped';

  // Create table body
  const tbody = document.createElement('tbody');

  filteredAdversaries.forEach((adversary) => {
    const row = document.createElement('tr');

    // First column: Name, CR, XP
    const nameCell = document.createElement('td');
    nameCell.className = 'align-middle';
    nameCell.innerHTML = `<strong>${formatText(
      adversary.name
    )}</strong> (CR: ${adversary.cr}, XP: ${adversary.xp})`;
    row.appendChild(nameCell);

    // Second column: Add button
    const buttonCell = document.createElement('td');
    buttonCell.className = 'text-end align-middle';

    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary btn-sm';
    addButton.innerHTML = '+';
    addButton.onclick = () => addAdversary(adversary); // Uses function from adversaryManager.js

    buttonCell.appendChild(addButton);
    row.appendChild(buttonCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  adversaryList.appendChild(table);

  console.log('Adversary list rendered.');
}

// ✅ Utility function to format text (capitalization & remove underscores)
function formatText(str) {
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
}
