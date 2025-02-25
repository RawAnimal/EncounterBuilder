// adversaryUI.js - Handles UI rendering for adversaries
import {
  getAdversaries,
  getUniqueCRValues,
  getXPRange,
  getHabitatList,
  getTypeList,
  getGroupList,
  extractWebSource,
} from './adversaryData.js';
import { addAdversary } from './adversaryManager.js';
import { formatCR } from './adversaryData.js';
import { initializeTooltip } from './tooltipManager.js';

// import { showToast } from './toastManager.js';

const filterObject = {
  search: null,
  cr: null,
  habitat: null,
  type: null,
  group: null,
  xpMin: null,
  xpMax: null,
};

let initialXPMin;
let initialXPMax;

document.addEventListener('DOMContentLoaded', async () => {
  renderAdversaryList();
  populateCRFilter();
  const filterIds = [
    'filter-cr',
    'filter-habitat',
    'filter-type',
    'filter-group',
    'filter-xp-min',
    'filter-xp-max',
  ];

  filterIds.forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateFilters);
  });

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
    clearFiltersButton.addEventListener('click', () => {
      clearTooltip(); // Hide tooltip immediately
      clearFilters();
    });
  }

  // Ensure resetFilterUI is triggered when Enter is pressed in XP input fields
  document
    .getElementById('filter-xp-min')
    ?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        resetFilterUI();
      }
    });

  document
    .getElementById('filter-xp-max')
    ?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        resetFilterUI();
      }
    });

  // Ensure resetFilterUI is triggered when user tabs out of XP Max input field
  document.getElementById('filter-xp-max')?.addEventListener('blur', () => {
    resetFilterUI();
  });
  initializeTooltip();
});

// Populate the XP Range Inputs
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
}

// Populate the Group Dropdown
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
    resetFilterUI();
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
    document.getElementById('filter-habitat').value || null;
  filterObject.type = document.getElementById('filter-type').value || null;
  filterObject.group = document.getElementById('filter-group').value || null;

  const xpMinInput = document.getElementById('filter-xp-min').value;
  const xpMaxInput = document.getElementById('filter-xp-max').value;

  // Only set xpMin and xpMax if they are different from their initial values
  const defaultXP = getXPRange(); // Get default min/max XP from population function

  filterObject.xpMin =
    xpMinInput && parseInt(xpMinInput) !== defaultXP.min
      ? parseInt(xpMinInput)
      : null;
  filterObject.xpMax =
    xpMaxInput && parseInt(xpMaxInput) !== defaultXP.max
      ? parseInt(xpMaxInput)
      : null;

  renderAdversaryList();
  updateAppliedFilters();
  updateClearFiltersButton();
  if (!document.activeElement.matches('#filter-xp-min, #filter-xp-max')) {
    resetFilterUI();
  }
  initializeTooltip();
}

function updateAppliedFilters() {
  const appliedFiltersDiv = document.getElementById('applied-filters');
  appliedFiltersDiv.innerHTML = ''; // Clear existing badges

  // CR Filter Badge
  if (filterObject.cr) {
    const badge = createFilterBadge(
      `CR: ${formatText(filterObject.cr)}`,
      () => {
        document.getElementById('filter-cr').value = '';
        filterObject.cr = null;
        updateFilters();
      }
    );
    appliedFiltersDiv.appendChild(badge);
  }

  // Habitat Filter Badge
  if (filterObject.habitat) {
    const badge = createFilterBadge(
      `Habitat: ${formatText(filterObject.habitat)}`,
      () => {
        document.getElementById('filter-habitat').value = '';
        filterObject.habitat = null;
        updateFilters();
      }
    );
    appliedFiltersDiv.appendChild(badge);
  }

  // Type Filter Badge
  if (filterObject.type) {
    const badge = createFilterBadge(
      `Type: ${formatText(filterObject.type)}`,
      () => {
        document.getElementById('filter-type').value = '';
        filterObject.type = null;
        updateFilters();
      }
    );
    appliedFiltersDiv.appendChild(badge);
  }

  // Group Filter Badge
  if (filterObject.group) {
    const badge = createFilterBadge(
      `Group: ${formatText(filterObject.group)}`,
      () => {
        document.getElementById('filter-group').value = '';
        filterObject.group = null;
        updateFilters();
      }
    );
    appliedFiltersDiv.appendChild(badge);
  }

  // XP Filter Badge
  if (
    (filterObject.xpMin !== null && filterObject.xpMin !== getXPRange().min) ||
    (filterObject.xpMax !== null && filterObject.xpMax !== getXPRange().max)
  ) {
    const xpText = `XP: ${filterObject.xpMin || '0'} - ${
      filterObject.xpMax || 'Max'
    }`;
    const badge = createFilterBadge(xpText, () => {
      document.getElementById('filter-xp-min').value = getXPRange().min;
      document.getElementById('filter-xp-max').value = getXPRange().max;
      filterObject.xpMin = null;
      filterObject.xpMax = null;
      updateFilters();
    });
    appliedFiltersDiv.appendChild(badge);
  }
}

function createFilterBadge(text, onClick) {
  const badge = document.createElement('span');
  badge.className = 'badge bg-primary m-2 p-2';
  badge.innerHTML = `${text} <span class="ms-1" style="cursor:pointer;">&times;</span>`;

  badge.querySelector('span').addEventListener('click', onClick);
  return badge;
}

function updateClearFiltersButton() {
  const clearButton = document.getElementById('clear-filters');
  const hasFilters = Object.values(filterObject).some(
    (value) => value !== null
  );
  const hasSearch =
    document.getElementById('search-adversary')?.value.trim().length > 0;

  // Keep the Clear Filters button always enabled
  clearButton.disabled = false;

  clearTooltip();
}

function clearTooltip() {
  var clearFiltersDiv = document.getElementById('clear-filters-div');
  if (!clearFiltersDiv) return;

  var tooltipInstance = bootstrap.Tooltip.getInstance(clearFiltersDiv);
  if (tooltipInstance) {
    tooltipInstance.hide();
    tooltipInstance.dispose();
  }
}

function clearFilters() {
  clearTooltip(); // Hide tooltip immediately
  // Reset all filter values
  document.getElementById('filter-cr').value = '';
  document.getElementById('filter-habitat').value = '';
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-group').value = '';
  document.getElementById('filter-xp-min').value = getXPRange().min;
  document.getElementById('filter-xp-max').value = getXPRange().max;
  document.getElementById('search-adversary').value = '';

  // Reset filter object
  Object.keys(filterObject).forEach((key) => {
    filterObject[key] = null;
  });

  // Update applied filters (removes badges)
  updateAppliedFilters();

  // Refresh the list
  renderAdversaryList();

  // Update Clear Filters button (tooltip remains intact)
  updateClearFiltersButton();

  resetFilterUI();
  initializeTooltip();
}

// Function to render the adversary list based on filters
function renderAdversaryList(searchQuery = '') {
  const adversaryList = document.getElementById('adversary-list');
  adversaryList.innerHTML = '';

  let adversaries = getAdversaries(); // Fetch the adversary list

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
      (adv.group &&
        Array.isArray(adv.group) &&
        adv.group.includes(filterObject.group));

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
  // Update the adversary count display
  const adversaryCount = document.getElementById('adversary-count');
  const totalAdversaries = adversaries.length;
  const filteredCount = filteredAdversaries.length;

  // Show total records when no filters are applied
  if (
    filteredCount === totalAdversaries &&
    Object.values(filterObject).every(
      (value) => value === null || value === ''
    )
  ) {
    adversaryCount.setAttribute('data-tooltip', 'top');
    adversaryCount.setAttribute(
      'title',
      `Showing ${totalAdversaries} Adversaries`
    );
    adversaryCount.innerText = `${totalAdversaries}~${totalAdversaries}`;
  } else {
    adversaryCount.setAttribute('data-tooltip', 'top');
    adversaryCount.setAttribute(
      'title',
      `Showing ${filteredCount} of ${totalAdversaries}<br/>Adversaries`
    );
    adversaryCount.innerText = `${filteredCount}~${totalAdversaries}`;
  }

  if (filteredAdversaries.length === 0) {
    adversaryList.innerHTML = 'No bad guys matching your criteria.';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-striped';
  const tbody = document.createElement('tbody');

  filteredAdversaries.forEach((adversary) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.className = 'align-middle';

    const sourceLink = adversary.source ? extractWebSource(adversary) : null;

    if (sourceLink) {
      const nameLink = document.createElement('a');
      nameLink.href = sourceLink;
      nameLink.target = '_blank'; // Open in new tab
      nameLink.rel = 'noopener noreferrer'; // Security best practice
      nameLink.className = 'fw-bold text-primary text-decoration-none';
      nameLink.textContent = formatText(adversary.name);

      nameCell.appendChild(nameLink);
    } else {
      nameCell.innerHTML = `<strong>${formatText(adversary.name)}</strong>`;
    }

    // ✅ CR Cell
    const crCell = document.createElement('td');
    crCell.className = 'align-middle';
    crCell.textContent = formatCR(adversary.cr); // Ensure CR is displayed

    // ✅ XP Cell
    const xpCell = document.createElement('td');
    xpCell.className = 'align-middle';
    xpCell.textContent = adversary.xp; // Ensure XP is displayed

    // ✅ Append Cells to Row
    row.appendChild(nameCell);
    row.appendChild(crCell);
    row.appendChild(xpCell);

    // ✅ Append Row to Table Body
    tbody.appendChild(row);

    // Create a table cell for buttons (same column for Associations + Add)
    const buttonCell = document.createElement('td');
    buttonCell.className = 'text-end align-middle';

    // Create a div to wrap both buttons (ensures correct spacing)
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'd-flex gap-1 justify-content-end';

    // Create the Add button
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary btn-sm';
    addButton.setAttribute('data-tooltip', 'top');
    addButton.setAttribute('title', 'Add To Encounter');
    addButton.innerHTML = '<i class="bi bi-plus"></i>';

    addButton.onclick = () => addAdversary(adversary);

    // Append Add button to wrapper
    buttonWrapper.appendChild(addButton);

    // Only create the Associations button if associations exist
    if (adversary.associations && adversary.associations.length > 0) {
      const assocButton = document.createElement('button');
      assocButton.className = 'btn btn-primary btn-sm assoc-btn';
      assocButton.setAttribute('data-tooltip', 'top');
      assocButton.innerHTML = '<i class="bi bi-link"></i>';

      const formattedAssociations = adversary.associations
        .map((a) => formatText(a))
        .join('<br>');

      assocButton.setAttribute('title', formattedAssociations);

      buttonWrapper.prepend(assocButton);
    }

    // Append the button wrapper to the table cell
    buttonCell.appendChild(buttonWrapper);
    row.appendChild(buttonCell);
  });

  table.appendChild(tbody);
  adversaryList.appendChild(table);

  initializeTooltip();
}

// Keep Text Formatting Helper
function formatText(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function applyFilters() {
  let filteredAdversaries = getAdversaries().filter((adv) => {
    const matchesSearch =
      !filterObject.search ||
      adv.name.toLowerCase().includes(filterObject.search);
    const matchesCR =
      !filterObject.cr || adv.cr.toString() === filterObject.cr;
    const matchesHabitat =
      !filterObject.habitat ||
      (adv.habitat && adv.habitat.includes(filterObject.habitat));
    const matchesType = !filterObject.type || adv.type === filterObject.type;
    const matchesGroup =
      !filterObject.group ||
      (Array.isArray(adv.group) && adv.group.includes(filterObject.group));

    return (
      matchesSearch &&
      matchesCR &&
      matchesHabitat &&
      matchesType &&
      matchesGroup
    );
  });
  resetFilterUI();
  renderAdversaryList(filteredAdversaries);
}

function resetFilterUI() {
  // Find all filter buttons and unselect them
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.classList.remove('active', 'btn-primary'); // Remove active state
    button.classList.add('btn-secondary'); // Remove active state
  });

  // Hide all dropdown menus
  document.querySelectorAll('.filter-div').forEach((dropdown) => {
    dropdown.classList.add('d-none'); // Hide dropdown
  });
}

export {
  renderAdversaryList,
  populateCRFilter,
  populateXPFilter,
  populateHabitatFilter,
  populateTypeFilter,
  populateGroupFilter,
  applyFilters,
};
