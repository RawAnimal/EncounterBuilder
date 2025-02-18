// Version: 1.1 | adversaryUI.js
// Handles: Managing dropdown visibility, Rendering the adversary table

const adversaryList = document.getElementById('adversary-list');
const adversarySearch = document.getElementById('adversary-search');

function displayAdversaries(filter = '') {
  adversaryList.innerHTML = '';

  const selectedCR = crFilter.value;
  const selectedHabitat = habitatFilter.value;
  const selectedType = typeFilter.value;
  const selectedGroup = groupFilter.value;

  const filteredAdversaries = adversaries.filter(
    (adversary) =>
      adversary.name.toLowerCase().includes(filter.toLowerCase()) &&
      (selectedCR === '' || formatCR(adversary.cr) === selectedCR) &&
      (selectedHabitat === '' ||
        adversary.habitat.includes(selectedHabitat)) &&
      (selectedType === '' || adversary.type === selectedType) &&
      (selectedGroup === '' || adversary.group === selectedGroup)
  );

  const table = document.createElement('table');
  table.classList.add('table', 'table-striped', 'table-bordered');
  table.innerHTML = `
          <thead>
              <tr>
                  <th>Name</th>
                  <th>CR</th>
                  <th>XP</th>
                  <th>Action</th>
              </tr>
          </thead>
          <tbody>
              ${filteredAdversaries
                .map(
                  (adversary) => `
                  <tr>
                      <td>${adversary.name}</td>
                      <td>${formatCR(adversary.cr)}</td>
                      <td>${adversary.xp}</td>
                      <td class="text-end"><button class="btn btn-primary btn-sm add-adversary" data-name="${
                        adversary.name
                      }">Add</button></td>
                  </tr>
              `
                )
                .join('')}
          </tbody>
      `;
  adversaryList.appendChild(table);
}

// Ensure filtering updates the list
document.addEventListener('DOMContentLoaded', () => {
  adversarySearch.addEventListener('input', (event) =>
    displayAdversaries(event.target.value)
  );

  [crFilter, habitatFilter, typeFilter, groupFilter].forEach((filter) => {
    filter.addEventListener('change', () => {
      displayAdversaries(adversarySearch.value);
    });
  });

  loadAdversaries(); // Ensure this runs after all scripts are loaded
});
