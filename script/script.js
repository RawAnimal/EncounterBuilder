document.addEventListener('DOMContentLoaded', () => {
  const characterClassInput = document.getElementById('character-class');
  const characterLevelInput = document.getElementById('character-level');
  const addCharacterButton = document.getElementById('add-character');
  const characterTableBody = document.getElementById('character-table-body');
  const adversaryList = document.getElementById('adversary-list');
  const adversarySearch = document.getElementById('adversary-search');

  let characters = [];
  let adversaries = [];

  // Ensure elements exist before executing functions
  if (
    !characterClassInput ||
    !characterLevelInput ||
    !adversaryList ||
    !adversarySearch
  ) {
    console.error('One or more required elements are missing from the DOM.');
    return;
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
      displayAdversaries();
    } catch (error) {
      console.error('Error loading adversaries:', error);
    }
  }

  // Function to display adversaries in a scrollable list
  function displayAdversaries(filter = '') {
    adversaryList.innerHTML = '';
    adversaries
      .filter((adversary) =>
        adversary.name.toLowerCase().includes(filter.toLowerCase())
      )
      .forEach((adversary) => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-group-item');
        listItem.textContent = `${adversary.name} (CR ${adversary.cr})`;
        adversaryList.appendChild(listItem);
      });
  }

  // Search functionality for adversaries
  adversarySearch.addEventListener('input', (event) => {
    displayAdversaries(event.target.value);
  });

  // Load classes from JSON file
  async function loadClasses() {
    try {
      const response = await fetch('data/classes.json'); // Ensure this file exists
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      populateClassDropdown(data.classes);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }

  // Populate class dropdown
  function populateClassDropdown(classes) {
    characterClassInput.innerHTML = '';
    classes.forEach((className) => {
      const option = document.createElement('option');
      option.value = className;
      option.textContent = className;
      characterClassInput.appendChild(option);
    });
  }

  // Populate level dropdown
  function populateLevelDropdown() {
    characterLevelInput.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Level ${i}`;
      if (i === 5) option.selected = true;
      characterLevelInput.appendChild(option);
    }
  }

  // Initialize dropdowns and load data
  populateLevelDropdown();
  loadClasses();
  loadAdversaries();
});
