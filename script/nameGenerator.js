document.addEventListener('DOMContentLoaded', () => {
  const characterNameInput = document.getElementById('character-name');
  const regenerateNameButton = document.getElementById('regenerate-name');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let firstNames = [];
  let lastNames = [];
  let useMaleNames = false;
  let useFemaleNames = false;

  let randomNamesData = null; // Global storage for names

  async function loadRandomNames() {
    try {
      const masterResponse = await fetch('data/dnd_2024_master.json');
      if (!masterResponse.ok) throw new Error('Failed to fetch master data');

      const masterData = await masterResponse.json();
      const namesUrl = masterData.data?.names;

      if (!namesUrl) throw new Error('Names dataset path not found');

      const namesResponse = await fetch(namesUrl);
      if (!namesResponse.ok) throw new Error('Failed to fetch names data');

      window.randomNamesData = await namesResponse.json(); // Store globally
      //window.randomNamesData = randomNamesData;
    } catch (error) {
      console.error('Error loading random names:', error);
    }
  }

  // Function to generate a random name
  // function generateRandomName() {
  //   let availableNames = firstNames.filter(
  //     (nameObj) =>
  //       (useMaleNames && nameObj.category === 'male') ||
  //       (useFemaleNames && nameObj.category === 'female') ||
  //       (!useMaleNames && !useFemaleNames && nameObj.category === 'both')
  //   );

  //   if (availableNames.length === 0) return 'Unknown Adventurer';
  //   const firstName =
  //     availableNames[Math.floor(Math.random() * availableNames.length)].name;
  //   const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  //   return `${firstName} ${lastName}`;
  // }

  // Function to generate a random name and assign it to the character name input field
  // Need
  function generateRandomName() {
    // Get filtered names
    const { firstNames, lastNames } = filterNameList();

    if (!firstNames || firstNames.length === 0) {
      console.warn('No first names available to select from.');
      return null;
    }

    // Select a random first name
    const randomFirstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];

    // Select a random last name if available
    let randomLastName = '';
    if (lastNames.length > 0) {
      randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    }

    // Construct full name (First Last)
    const fullName = randomLastName
      ? `${randomFirstName} ${randomLastName}`
      : randomFirstName;

    // Assign the full name to the input field
    const nameInput = document.getElementById('character-name');
    if (nameInput) {
      nameInput.value = fullName;
    } else {
      console.error('Name input field not found!');
    }

    return fullName;
  }

  // Expose the function globally so it can be used elsewhere
  window.generateRandomName = generateRandomName;

  // Function to set a new default name (always overwrites existing name)
  // need
  function setDefaultCharacterName() {
    const nameField = document.getElementById('character-name');
    if (!nameField) {
      console.error('Error: Name input field not found.');
      return;
    }

    const randomFullName = generateRandomName(); // Now generates both first & last name

    if (randomFullName) {
      nameField.value = randomFullName;
    } else {
      console.warn('No valid name generated.');
    }
  }

  // Attach function globally so other scripts can access it
  window.setDefaultCharacterName = setDefaultCharacterName;

  // Regenerate name when button is clicked
  regenerateNameButton.addEventListener('click', generateRandomName);

  // Toggle gender selection
  function toggleGenderButton(button, gender) {
    const maleButton = document.getElementById('toggle-male');
    const femaleButton = document.getElementById('toggle-female');

    if (gender === 'male') {
      maleButton.classList.toggle('active');
      femaleButton.classList.remove('active');
    } else {
      femaleButton.classList.toggle('active');
      maleButton.classList.remove('active');
    }

    setDefaultCharacterName(); // Generate a new name based on new filters
  }

  // Function to filter first and last names based on selected filters
  // Need
  function filterNameList() {
    const speciesSelect = document.getElementById('species-select');
    const limitToSpecies = document.getElementById('limit-to-species');
    const maleButton = document.getElementById('toggle-male');
    const femaleButton = document.getElementById('toggle-female');

    const selectedSpecies = speciesSelect.value;
    const limitToSpeciesActive = limitToSpecies.classList.contains('active');
    const maleActive = document
      .getElementById('toggle-male')
      .classList.contains('active');
    const femaleActive = document
      .getElementById('toggle-female')
      .classList.contains('active');

    let firstNameList = [];
    let lastNameList = [];

    if (!window.randomNamesData || !window.randomNamesData.species_names) {
      console.error('Error: Random names data not available.');
      return { firstNames: [], lastNames: [] };
    }

    // Helper function to fetch names for a given species
    function getNamesForSpecies(species) {
      const namesData = window.randomNamesData.species_names[species];

      if (!namesData) return { firstNames: [], lastNames: [] };

      let filteredFirstNames = [];
      let filteredLastNames = namesData.last_names || [];

      if (!maleActive && !femaleActive) {
        filteredFirstNames = [
          ...(namesData.first_names.any || []),
          ...(namesData.first_names.male || []),
          ...(namesData.first_names.female || []),
        ];
      } else if (maleActive) {
        filteredFirstNames = [
          ...(namesData.first_names.any || []),
          ...(namesData.first_names.male || []),
        ];
      } else if (femaleActive) {
        filteredFirstNames = [
          ...(namesData.first_names.any || []),
          ...(namesData.first_names.female || []),
        ];
      }

      return { firstNames: filteredFirstNames, lastNames: filteredLastNames };
    }

    // Apply filtering based on "Limit to Species" toggle
    if (limitToSpeciesActive) {
      const speciesNames = getNamesForSpecies(selectedSpecies);
      firstNameList = speciesNames.firstNames;
      lastNameList = speciesNames.lastNames;
    } else {
      for (const species in window.randomNamesData.species_names) {
        const speciesNames = getNamesForSpecies(species);
        firstNameList.push(...speciesNames.firstNames);
        lastNameList.push(...speciesNames.lastNames);
      }
    }

    // Sort names alphabetically and remove duplicates
    firstNameList = [...new Set(firstNameList)].sort((a, b) =>
      a.localeCompare(b)
    );
    lastNameList = [...new Set(lastNameList)].sort((a, b) =>
      a.localeCompare(b)
    );

    return { firstNames: firstNameList, lastNames: lastNameList };
  }

  window.filterNameList = filterNameList;

  toggleMaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleMaleButton, 'male')
  );
  toggleFemaleButton.addEventListener('click', () =>
    toggleGenderButton(toggleFemaleButton, 'female')
  );

  // Initialize name generation
  loadRandomNames();
});
