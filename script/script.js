document.addEventListener('DOMContentLoaded', () => {
  const characterNameInput = document.getElementById('character-name');
  const regenerateNameButton = document.getElementById('regenerate-name');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');
  const characterClassInput = document.getElementById('character-class');
  const characterLevelInput = document.getElementById('character-level');
  const addCharacterButton = document.getElementById('add-character');
  const characterTableBody = document.getElementById('character-table-body');
  const creatureList = document.getElementById('creature-list');

  let firstNames = [];
  let lastNames = [];
  let characters = [];
  let creatures = [];
  let userModifiedName = false;
  let useMaleNames = false;
  let useFemaleNames = false;

  // Load random names from JSON file
  async function loadRandomNames() {
    try {
      const response = await fetch('data/random_names.json');
      const data = await response.json();
      firstNames = data.firstNames;
      lastNames = data.lastNames;
      setDefaultCharacterName();
    } catch (error) {
      console.error('Error loading random names:', error);
    }
  }

  // Load creatures from JSON file
  async function loadCreatures() {
    try {
      const response = await fetch('data/creatures.json');
      creatures = await response.json();
      displayCreatures();
    } catch (error) {
      console.error('Error loading creatures:', error);
    }
  }

  // Function to display creatures in a scrollable list
  function displayCreatures() {
    creatureList.innerHTML = '';
    creatures.forEach((creature) => {
      const listItem = document.createElement('div');
      listItem.classList.add('list-group-item');
      listItem.textContent = `${creature.name} (CR ${creature.cr})`;
      creatureList.appendChild(listItem);
    });
  }

  // Load creatures automatically on page load
  loadCreatures();

  // Function to generate a random name
  function generateRandomName() {
    let availableNames = firstNames.filter(
      (nameObj) =>
        (useMaleNames && nameObj.category === 'male') ||
        (useFemaleNames && nameObj.category === 'female') ||
        (!useMaleNames && !useFemaleNames && nameObj.category === 'both')
    );

    if (availableNames.length === 0) return 'Unknown Adventurer';
    const firstName =
      availableNames[Math.floor(Math.random() * availableNames.length)].name;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  // Function to set a default character name
  function setDefaultCharacterName() {
    if (!userModifiedName) {
      characterNameInput.value = generateRandomName();
    }
  }

  // Load classes from JSON file
  async function loadClasses() {
    try {
      const response = await fetch('data/classes.json');
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
  loadRandomNames();
  loadClasses();
});
