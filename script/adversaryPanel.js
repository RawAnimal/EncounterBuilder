// Version: 1.0

document.addEventListener('DOMContentLoaded', () => {
  const adversaryList = document.getElementById('adversary-list');
  const adversarySearch = document.getElementById('adversary-search');
  const crFilter = document.getElementById('cr-filter');
  const habitatFilter = document.getElementById('habitat-filter');
  const typeFilter = document.getElementById('type-filter');
  const groupFilter = document.getElementById('group-filter');
  const clearFiltersButton = document.getElementById('clear-filters');

  const filterButtons = {
    'filter-cr': crFilter,
    'filter-habitat': habitatFilter,
    'filter-type': typeFilter,
    'filter-group': groupFilter,
  };

  let adversaries = [];

  // Function to format CR values
  function formatCR(cr) {
    const crMap = { 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' };
    return crMap[cr] || cr.toString();
  }

  // Toggle filter dropdowns & button styles
  function toggleFilter(selectedButtonId) {
    Object.keys(filterButtons).forEach((buttonId) => {
      const button = document.getElementById(buttonId);
      const dropdown = filterButtons[buttonId];

      if (buttonId === selectedButtonId) {
        const isActive = button.classList.contains('btn-primary');

        // Reset all buttons and dropdowns
        document.querySelectorAll('.btn-group button').forEach((btn) => {
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
        });
        document
          .querySelectorAll('#filter-dropdowns select')
          .forEach((select) => select.classList.add('d-none'));

        if (!isActive) {
          button.classList.add('btn-primary');
          button.classList.remove('btn-secondary');
          dropdown.classList.remove('d-none');
        }
      } else {
        button.classList.add('btn-secondary');
        button.classList.remove('btn-primary');
        dropdown.classList.add('d-none');
      }
    });
  }

  // Assign toggle functionality to filter buttons
  Object.keys(filterButtons).forEach((buttonId) => {
    document.getElementById(buttonId).addEventListener('click', () => {
      toggleFilter(buttonId);
    });
  });

  // Load adversaries from adversaries.json
  async function loadAdversaries() {
    try {
      const response = await fetch('data/adversaries.json');
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data.creatures)) {
        throw new Error('Adversaries data is not an array');
      }

      adversaries = data.creatures;
      populateCRFilter();
      populateHabitatFilter();
      populateTypeFilter();
      populateGroupFilter();
      displayAdversaries();
    } catch (error) {
      console.error('Error loading adversaries:', error);
    }
  }

  // Populate filters dynamically
  function populateDropdown(dropdown, values, defaultText) {
    dropdown.innerHTML = `<option value="">${defaultText}</option>`;
    values.sort().forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      dropdown.appendChild(option);
    });
  }

  function populateCRFilter() {
    const uniqueCRs = [...new Set(adversaries.map((a) => formatCR(a.cr)))];
    populateDropdown(crFilter, uniqueCRs, 'All CRs');
  }

  function populateHabitatFilter() {
    const uniqueHabitats = [...new Set(adversaries.flatMap((a) => a.habitat))];
    populateDropdown(habitatFilter, uniqueHabitats, 'All Habitats');
  }

  function populateTypeFilter() {
    const uniqueTypes = [...new Set(adversaries.map((a) => a.type))];
    populateDropdown(typeFilter, uniqueTypes, 'All Types');
  }

  function populateGroupFilter() {
    const uniqueGroups = [...new Set(adversaries.map((a) => a.group))];
    populateDropdown(groupFilter, uniqueGroups, 'All Groups');
  }

  // Function to display adversaries
  function displayAdversaries(filter = '') {
    adversaryList.innerHTML = '';
    const selectedCR = crFilter.value;
    const selectedHabitat = habitatFilter.value;
    const selectedType = typeFilter.value;
    const selectedGroup = groupFilter.value;

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
      .filter(
        (adversary) =>
          adversary.name.toLowerCase().includes(filter.toLowerCase()) &&
          (selectedCR === '' || formatCR(adversary.cr) === selectedCR) &&
          (selectedHabitat === '' ||
            adversary.habitat.includes(selectedHabitat)) &&
          (selectedType === '' || adversary.type === selectedType) &&
          (selectedGroup === '' || adversary.group === selectedGroup)
      )
      .forEach((adversary) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${adversary.name}</td>
                    <td>${formatCR(adversary.cr)}</td>
                    <td>${adversary.xp}</td>
                    <td><button class="btn btn-primary btn-sm add-adversary" data-name="${
                      adversary.name
                    }">Add</button></td>
                `;
        tbody.appendChild(row);
      });

    table.appendChild(tbody);
    adversaryList.appendChild(table);
  }

  // Apply filtering when a selection is made
  [crFilter, habitatFilter, typeFilter, groupFilter].forEach((filter) => {
    filter.addEventListener('change', () =>
      displayAdversaries(adversarySearch.value)
    );
  });

  adversarySearch.addEventListener('input', (event) => {
    displayAdversaries(event.target.value);
  });

  // Clear Filters event listener
  clearFiltersButton.addEventListener('click', () => {
    crFilter.value = '';
    habitatFilter.value = '';
    typeFilter.value = '';
    groupFilter.value = '';
    adversarySearch.value = '';

    // Reset button group colors & hide dropdowns
    document.querySelectorAll('.btn-group button').forEach((btn) => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    });
    document
      .querySelectorAll('#filter-dropdowns select')
      .forEach((select) => select.classList.add('d-none'));

    displayAdversaries();
  });

  // Load adversaries automatically
  loadAdversaries();
});
