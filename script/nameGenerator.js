document.addEventListener('DOMContentLoaded', () => {
  const characterNameInput = document.getElementById('character-name');
  const regenerateNameButton = document.getElementById('regenerate-name');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let firstNames = [];
  let lastNames = [];
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

  // Initialize name generation
  loadRandomNames();
});
