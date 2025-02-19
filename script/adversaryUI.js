// adversaryUI.js - Handles UI rendering for adversaries

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary UI...');
  renderAdversaryList();
  populateCRFilter(); // ✅ Populate the CR filter dropdown
  populateHabitatFilter(); // ✅ Populate the Habitat filter dropdown
  populateTypeFilter(); // ✅ Populate the Type filter dropdown

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

// ✅ New Function: Populate the Type Dropdown
function populateTypeFilter() {
  const typeSelect = document.getElementById('filter-type');
  if (!typeSelect) return;

  // Clear existing options
  typeSelect.innerHTML = '';

  // Get type list from adversaryData.js
  const types = getTypeList();

  // Add "All Types" option at the top
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Types';
  typeSelect.appendChild(allOption);

  // Add each type as an option
  types.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    typeSelect.appendChild(option);
  });

  console.log('Type filter populated:', types);
}

// ✅ Function to populate the Habitat dropdown
function populateHabitatFilter() {
  const habitatSelect = document.getElementById('filter-habitat');
  if (!habitatSelect) return;

  // Clear existing options
  habitatSelect.innerHTML = '';

  // Get habitat list from adversaryData.js
  const habitats = getHabitatList();

  // Add "All Habitats" option at the top
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Habitats';
  habitatSelect.appendChild(allOption);

  // Add each habitat as an option
  habitats.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    habitatSelect.appendChild(option);
  });

  console.log('Habitat filter populated:', habitats);
}

// ✅ Function to populate the CR dropdown
function populateCRFilter() {
  const crSelect = document.getElementById('filter-cr');
  if (!crSelect) return;

  // Clear existing options
  crSelect.innerHTML = '';

  // Get unique CR values from adversaryData.js
  const crValues = getUniqueCRValues();

  // Add "All CRs" option at the top
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All CRs';
  crSelect.appendChild(allOption);

  // Add each CR as an option
  crValues.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    crSelect.appendChild(option);
  });

  console.log('CR filter populated:', crValues);
}

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
