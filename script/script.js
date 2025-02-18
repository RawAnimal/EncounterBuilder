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

  // Function to toggle gender filter buttons
  function toggleGenderButton(button, gender) {
    if (gender === 'male') {
      useMaleNames = !useMaleNames;
      useFemaleNames = false;
      toggleMaleButton.classList.toggle('btn-primary', useMaleNames);
      toggleMaleButton.classList.toggle('btn-secondary', !useMaleNames);
      toggleFemaleButton.classList.remove('btn-primary');
      toggleFemaleButton.classList.add('btn-secondary');
    } else {
      useFemaleNames = !useFemaleNames;
      useMaleNames = false;
      toggleFemaleButton.classList.toggle('btn-primary', useFemaleNames);
      toggleFemaleButton.classList.toggle('btn-secondary', !useFemaleNames);
      toggleMaleButton.classList.remove('btn-primary');
      toggleMaleButton.classList.add('btn-secondary');
    }
    setDefaultCharacterName();
  }

  // Add event listeners for gender selection
  toggleMaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleMaleButton, 'male')
  );
  toggleFemaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleFemaleButton, 'female')
  );

  // Handle manual name input
  characterNameInput.addEventListener('focus', () => {
    characterNameInput.value = '';
    userModifiedName = true;
  });

  characterNameInput.addEventListener('blur', () => {
    if (characterNameInput.value.trim() === '') {
      userModifiedName = false;
      setDefaultCharacterName();
    }
  });

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

  // Add event listener to regenerate name
  regenerateNameButton.addEventListener('click', () => {
    userModifiedName = false;
    setDefaultCharacterName();
  });

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
