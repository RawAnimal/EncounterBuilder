document.addEventListener('DOMContentLoaded', () => {
  const characterNameInput = document.getElementById('character-name');
  const regenerateNameButton = document.getElementById('regenerate-name');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let firstNames = [];
  let lastNames = [];
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

  // Function to set a new default name (always overwrites existing name)
  function setDefaultCharacterName() {
    const newName = generateRandomName();
    characterNameInput.value = newName;
  }

  // Attach function globally so other scripts can access it
  window.setDefaultCharacterName = setDefaultCharacterName;

  // Regenerate name when button is clicked
  regenerateNameButton.addEventListener('click', setDefaultCharacterName);

  // Toggle gender selection
  function toggleGenderButton(button, gender) {
    if (gender === 'male') {
      useMaleNames = !useMaleNames;
      useFemaleNames = false;
    } else {
      useFemaleNames = !useFemaleNames;
      useMaleNames = false;
    }
    setDefaultCharacterName();
  }

  toggleMaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleMaleButton, 'male')
  );
  toggleFemaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleFemaleButton, 'female')
  );

  // Initialize name generation
  loadRandomNames();
});
