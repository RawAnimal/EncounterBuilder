// adversaryUI.js - Handles UI rendering for adversaries

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary UI...');
  renderAdversaryList();
  populateCRFilter();
  populateXPFilter(); // ✅ Ensure XP filter loads properly
  populateHabitatFilter();
  populateTypeFilter();
  populateGroupFilter();

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => toggleFilter(button));
  });

  const searchInput = document.getElementById('search-adversary');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdversaryList(searchInput.value);
    });
  }

  const clearFiltersButton = document.getElementById('clear-filters');
  if (clearFiltersButton) {
    clearFiltersButton.addEventListener('click', () => clearFilters());
  }
});

// ✅ New Function: Populate the XP Range Inputs
function populateXPFilter() {
  const xpMinInput = document.getElementById('filter-xp-min');
  const xpMaxInput = document.getElementById('filter-xp-max');
  if (!xpMinInput || !xpMaxInput) return;

  const { min, max } = getXPRange();

  xpMinInput.value = min;
  xpMaxInput.value = max;
  xpMinInput.min = min;
  xpMinInput.max = max;
  xpMaxInput.min = min;
  xpMaxInput.max = max;

  console.log('XP filter populated:', { min, max });
}

// ✅ Existing Function: Populate the Group Dropdown
function populateGroupFilter() {
  const groupSelect = document.getElementById('filter-group');
  if (!groupSelect) return;

  groupSelect.innerHTML = '';

  const groups = getGroupList();

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Groups';
  groupSelect.appendChild(allOption);

  groups.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    groupSelect.appendChild(option);
  });

  console.log('Group filter populated:', groups);
}

// ✅ Existing Function: Populate the Habitat Dropdown
function populateHabitatFilter() {
  const habitatSelect = document.getElementById('filter-habitat');
  if (!habitatSelect) return;

  habitatSelect.innerHTML = '';

  const habitats = getHabitatList();

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Habitats';
  habitatSelect.appendChild(allOption);

  habitats.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    habitatSelect.appendChild(option);
  });

  console.log('Habitat filter populated:', habitats);
}

// ✅ Existing Function: Populate the Type Dropdown
function populateTypeFilter() {
  const typeSelect = document.getElementById('filter-type');
  if (!typeSelect) return;

  typeSelect.innerHTML = '';

  const types = getTypeList();

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All Types';
  typeSelect.appendChild(allOption);

  types.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    typeSelect.appendChild(option);
  });

  console.log('Type filter populated:', types);
}

// ✅ Existing Function: Populate the CR Dropdown
function populateCRFilter() {
  const crSelect = document.getElementById('filter-cr');
  if (!crSelect) return;

  crSelect.innerHTML = '';

  const crValues = getUniqueCRValues();

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'All CRs';
  crSelect.appendChild(allOption);

  crValues.forEach(({ value, display }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = display;
    crSelect.appendChild(option);
  });

  console.log('CR filter populated:', crValues);
}

// ✅ Keep Existing UI Logic
function toggleFilter(button) {
  const filterId = button.dataset.filter;
  const activeButton = document.querySelector('.filter-btn.active');
  const activeFilterDiv = document.querySelector('.filter-div:not(.d-none)');

  if (button.classList.contains('active')) {
    button.classList.remove('active', 'btn-primary');
    button.classList.add('btn-secondary');
    document.getElementById(`filter-${filterId}-div`).classList.add('d-none');
    return;
  }

  if (activeButton) {
    activeButton.classList.remove('active', 'btn-primary');
    activeButton.classList.add('btn-secondary');
  }
  if (activeFilterDiv) activeFilterDiv.classList.add('d-none');

  button.classList.add('active', 'btn-primary');
  button.classList.remove('btn-secondary');

  document.getElementById(`filter-${filterId}-div`).classList.remove('d-none');
}

function renderAdversaryList(searchQuery = '') {
  console.log('Rendering adversary list...');

  const adversaryList = document.getElementById('adversary-list');
  adversaryList.innerHTML = '';

  const filteredAdversaries = adversaries.filter((adv) =>
    adv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredAdversaries.length === 0) {
    adversaryList.innerHTML = '<p>No adversaries found.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-striped';

  const tbody = document.createElement('tbody');

  filteredAdversaries.forEach((adversary) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.className = 'align-middle';
    nameCell.innerHTML = `<strong>${formatText(
      adversary.name
    )}</strong> (CR: ${adversary.cr}, XP: ${adversary.xp})`;
    row.appendChild(nameCell);

    const buttonCell = document.createElement('td');
    buttonCell.className = 'text-end align-middle';

    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary btn-sm';
    addButton.innerHTML = '+';
    addButton.onclick = () => addAdversary(adversary);

    buttonCell.appendChild(addButton);
    row.appendChild(buttonCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  adversaryList.appendChild(table);

  console.log('Adversary list rendered.');
}

// ✅ Keep Text Formatting Helper
function formatText(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
