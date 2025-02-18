// Version: 1.1 | adversaryFilters.js
// Handles: Filtering adversaries, Managing filter badges, Handling the button group UI

document.addEventListener('DOMContentLoaded', () => {
  const filterBadgesContainer = document.getElementById('filter-badges');
  const clearFiltersButton = document.getElementById('clear-filters');

  const filterButtons = {
    'filter-cr': document.getElementById('filter-cr'),
    'filter-habitat': document.getElementById('filter-habitat'),
    'filter-type': document.getElementById('filter-type'),
    'filter-group': document.getElementById('filter-group'),
  };

  const filterDropdowns = {
    'filter-cr': document.getElementById('cr-filter'),
    'filter-habitat': document.getElementById('habitat-filter'),
    'filter-type': document.getElementById('type-filter'),
    'filter-group': document.getElementById('group-filter'),
  };

  function updateFilterBadges() {
    filterBadgesContainer.innerHTML = '';

    const filters = {
      CR: crFilter.value,
      Habitat: habitatFilter.value,
      Type: typeFilter.value,
      Group: groupFilter.value,
    };

    Object.entries(filters).forEach(([label, value]) => {
      if (value) {
        const badge = document.createElement('span');
        badge.className =
          'badge bg-primary text-white d-flex align-items-center p-2';
        badge.style.whiteSpace = 'nowrap';
        badge.innerHTML = `${label}: ${formatText(
          value
        )} <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" data-filter="${label}"></button>`;

        filterBadgesContainer.appendChild(badge);
      }
    });

    document.querySelectorAll('.btn-close').forEach((button) => {
      button.addEventListener('click', (event) => {
        const filterType = event.target.getAttribute('data-filter');

        if (filterType === 'CR') crFilter.value = '';
        if (filterType === 'Habitat') habitatFilter.value = '';
        if (filterType === 'Type') typeFilter.value = '';
        if (filterType === 'Group') groupFilter.value = '';

        updateFilterBadges();
        displayAdversaries(adversarySearch.value);
      });
    });
  }

  function toggleDropdown(selectedButtonId) {
    Object.keys(filterButtons).forEach((buttonId) => {
      const button = filterButtons[buttonId];
      const dropdown = filterDropdowns[buttonId];

      if (buttonId === selectedButtonId) {
        const isActive = button.classList.contains('btn-primary');

        // Hide all other dropdowns
        Object.values(filterDropdowns).forEach((drop) =>
          drop.classList.add('d-none')
        );

        // Reset all buttons to secondary
        Object.values(filterButtons).forEach((btn) => {
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
        });

        // If not already active, show the dropdown and mark button as active
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

  // Attach click event listeners to filter buttons
  Object.keys(filterButtons).forEach((buttonId) => {
    filterButtons[buttonId].addEventListener('click', () => {
      toggleDropdown(buttonId);
    });
  });

  [crFilter, habitatFilter, typeFilter, groupFilter].forEach((filter) => {
    filter.addEventListener('change', () => {
      updateFilterBadges();
      displayAdversaries(adversarySearch.value);
    });
  });

  clearFiltersButton.addEventListener('click', () => {
    crFilter.value = '';
    habitatFilter.value = '';
    typeFilter.value = '';
    groupFilter.value = '';
    adversarySearch.value = '';

    // Hide dropdowns and reset button styles
    Object.values(filterDropdowns).forEach((drop) =>
      drop.classList.add('d-none')
    );
    Object.values(filterButtons).forEach((btn) => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    });

    filterBadgesContainer.innerHTML = '';

    displayAdversaries();
  });
});
