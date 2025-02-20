// adversaryUI.js - Handles UI rendering for adversaries

const filterObject = {
  search: null,
  cr: null,
  habitat: null,
  type: null,
  group: null,
  xpMin: null,
  xpMax: null,
};

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary UI...');
  renderAdversaryList();
  populateCRFilter();
  document
    .getElementById('filter-cr')
    ?.addEventListener('change', updateFilters);
  document
    .getElementById('filter-habitat')
    ?.addEventListener('change', updateFilters);
  document
    .getElementById('filter-type')
    ?.addEventListener('change', updateFilters);
  document
    .getElementById('filter-group')
    ?.addEventListener('change', updateFilters);
  document
    .getElementById('filter-xp-min')
    ?.addEventListener('input', updateFilters);
  document
    .getElementById('filter-xp-max')
    ?.addEventListener('input', updateFilters);

  populateXPFilter();
  populateHabitatFilter();
  populateTypeFilter();
  populateGroupFilter();

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => toggleFilter(button));
  });

  const searchInput = document.getElementById('search-adversary');
  if (searchInput) {
    searchInput.addEventListener('input', updateFilters);
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

// Function to update filters dynamically
function updateFilters() {
  filterObject.search =
    document.getElementById('search-adversary').value.trim().toLowerCase() ||
    null;
  filterObject.cr = document.getElementById('filter-cr').value || null;
  filterObject.habitat =
    document.getElementById('filter-habitat').value || null; // 🔹 Capture habitat filter
  filterObject.type = document.getElementById('filter-type').value || null;
  filterObject.group = document.getElementById('filter-group').value || null;
  filterObject.xpMin = document.getElementById('filter-xp-min').value
    ? parseInt(document.getElementById('filter-xp-min').value)
    : null;
  filterObject.xpMax = document.getElementById('filter-xp-max').value
    ? parseInt(document.getElementById('filter-xp-max').value)
    : null;

  renderAdversaryList();
}

// Function to render the adversary list based on filters
function renderAdversaryList(searchQuery = '') {
  console.log('Rendering adversary list...');

  let debugLog = `\n🔹 SEARCH QUERY: "${searchQuery}"\n`;
  debugLog += `🔹 FILTER OBJECT: ${JSON.stringify(filterObject)}\n`;
  debugLog += `🔹 ADVERSARIES BEFORE FILTERING: ${adversaries.length} total\n`;

  const adversaryList = document.getElementById('adversary-list');
  adversaryList.innerHTML = '';

  let filteredAdversaries = adversaries.filter((adv) => {
    const matchesSearch =
      !filterObject.search ||
      adv.name.toLowerCase().includes(filterObject.search);
    const matchesCR =
      !filterObject.cr || adv.cr.toString() === filterObject.cr;
    const matchesHabitat =
      !filterObject.habitat || adv.habitat.includes(filterObject.habitat);
    const matchesType = !filterObject.type || adv.type === filterObject.type;
    const matchesGroup =
      !filterObject.group ||
      (Array.isArray(adv.group) && adv.group.includes(filterObject.group));
    const matchesXP =
      (!filterObject.xpMin || adv.xp >= filterObject.xpMin) &&
      (!filterObject.xpMax || adv.xp <= filterObject.xpMax);

    return (
      matchesSearch &&
      matchesCR &&
      matchesHabitat &&
      matchesType &&
      matchesGroup &&
      matchesXP
    );
  });

  console.log('Filtered Adversaries:', filteredAdversaries);

  debugLog += `🔹 FILTERED ADVERSARIES: ${filteredAdversaries.length} total\n`;
  debugLog += `🔹 FINAL FILTER OBJECT: ${JSON.stringify(filterObject)}\n`;

  console.log(debugLog);

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
}

// ✅ Keep Text Formatting Helper
function formatText(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
