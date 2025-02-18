// Version: 1.2 | adversaryData.js
// Handles: Fetching adversary data, Formatting CR values, Populating dropdowns

let adversaries = [];

// Ensure filters are available for all scripts
const crFilter = document.getElementById('cr-filter');
const habitatFilter = document.getElementById('habitat-filter');
const typeFilter = document.getElementById('type-filter');
const groupFilter = document.getElementById('group-filter');

function formatCR(cr) {
  const crMap = { 0.125: '1/8', 0.25: '1/4', 0.5: '1/2' };
  return crMap[cr] || cr.toString();
}

async function loadAdversaries() {
  try {
    const response = await fetch('data/adversaries.json');
    if (!response.ok)
      throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.creatures))
      throw new Error('Adversaries data is not an array');
    adversaries = data.creatures;
    populateFilters();
    displayAdversaries();
  } catch (error) {
    console.error('Error loading adversaries:', error);
  }
}

function formatText(value) {
  return value
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
}

function populateDropdown(dropdown, values, defaultText) {
  dropdown.innerHTML = `<option value="">${defaultText}</option>`;
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = formatText(value);
    dropdown.appendChild(option);
  });
}

function populateFilters() {
  function parseCR(cr) {
    const crMap = { '1/8': 0.125, '1/4': 0.25, '1/2': 0.5 };
    return crMap[cr] || parseFloat(cr);
  }

  populateDropdown(
    crFilter,
    [...new Set(adversaries.map((a) => formatCR(a.cr)))].sort(
      (a, b) => parseCR(a) - parseCR(b)
    ),
    'All CRs'
  );

  populateDropdown(
    habitatFilter,
    [...new Set(adversaries.flatMap((a) => a.habitat))].sort(),
    'All Habitats'
  );
  populateDropdown(
    typeFilter,
    [...new Set(adversaries.map((a) => a.type))].sort(),
    'All Types'
  );
  populateDropdown(
    groupFilter,
    [...new Set(adversaries.map((a) => a.group))].sort(),
    'All Groups'
  );
}
