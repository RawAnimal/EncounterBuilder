document.addEventListener('DOMContentLoaded', () => {
  const adversaryList = document.getElementById('adversary-list');
  const adversarySearch = document.getElementById('adversary-search');
  const crFilter = document.getElementById('cr-filter');
  const habitatFilter = document.getElementById('habitat-filter');
  const typeFilter = document.getElementById('type-filter');
  const groupFilter = document.getElementById('group-filter');

  let adversaries = [];

  // Function to convert decimal CR values to fractions
  function formatCR(cr) {
    const crMap = {
      0.125: '1/8',
      0.25: '1/4',
      0.5: '1/2',
    };
    return crMap[cr] || cr.toString(); // Convert to string for proper comparison
  }

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
      populateCRFilter();
      populateHabitatFilter();
      populateTypeFilter();
      populateGroupFilter();
      displayAdversaries();
    } catch (error) {
      console.error('Error loading adversaries:', error);
    }
  }

  // Function to populate CR filter dropdown
  function populateCRFilter() {
    const uniqueCRs = [
      ...new Set(adversaries.map((a) => formatCR(a.cr))),
    ].sort((a, b) => {
      return parseFloat(a) - parseFloat(b);
    });

    crFilter.innerHTML = '<option value="">All CRs</option>';
    uniqueCRs.forEach((cr) => {
      const option = document.createElement('option');
      option.value = cr;
      option.textContent = `CR ${cr}`;
      crFilter.appendChild(option);
    });
  }

  // Function to populate Habitat filter dropdown
  function populateHabitatFilter() {
    const uniqueHabitats = [
      ...new Set(adversaries.flatMap((a) => a.habitat)),
    ].sort();

    habitatFilter.innerHTML = '<option value="">All Habitats</option>';
    uniqueHabitats.forEach((habitat) => {
      const option = document.createElement('option');
      option.value = habitat;
      option.textContent = habitat.charAt(0).toUpperCase() + habitat.slice(1);
      habitatFilter.appendChild(option);
    });
  }

  // Function to populate Type filter dropdown
  function populateTypeFilter() {
    const uniqueTypes = [...new Set(adversaries.map((a) => a.type))].sort();

    typeFilter.innerHTML = '<option value="">All Types</option>';
    uniqueTypes.forEach((type) => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      typeFilter.appendChild(option);
    });
  }

  // Function to populate Group filter dropdown
  function populateGroupFilter() {
    const uniqueGroups = [...new Set(adversaries.map((a) => a.group))].sort();

    groupFilter.innerHTML = '<option value="">All Groups</option>';
    uniqueGroups.forEach((group) => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent =
        group.charAt(0).toUpperCase() + group.slice(1).replace(/_/g, ' ');
      groupFilter.appendChild(option);
    });
  }

  // Function to display adversaries in a table with a fixed height
  function displayAdversaries(filter = '') {
    adversaryList.innerHTML = '';
    const selectedCR = crFilter.value;
    const selectedHabitat = habitatFilter.value;

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
          (typeFilter.value === '' || adversary.type === typeFilter.value) &&
          (groupFilter.value === '' || adversary.group === groupFilter.value)
      )
      .forEach((adversary) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${adversary.name}</td>
                    <td>${formatCR(adversary.cr)}</td>
                    <td>${adversary.xp}</td>
                    <td>
                        <button class="btn btn-primary btn-sm add-adversary" data-name="${
                          adversary.name
                        }">
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

  // CR Filter event listener
  crFilter.addEventListener('change', () => {
    displayAdversaries(adversarySearch.value);
  });

  // Type Filter event listener
  typeFilter.addEventListener('change', () => {
    displayAdversaries(adversarySearch.value);
  });

  // Group Filter event listener
  groupFilter.addEventListener('change', () => {
    displayAdversaries(adversarySearch.value);
  });

  // Habitat Filter event listener
  habitatFilter.addEventListener('change', () => {
    displayAdversaries(adversarySearch.value);
  });

  // Limit height of the adversary panel and make it scrollable
  adversaryList.style.maxHeight = '400px';
  adversaryList.style.overflowY = 'auto';

  // Load adversaries automatically on page load
  loadAdversaries();
});
