window.addEventListener('load', async () => {
  try {
    const response = await fetch('data/dnd_2024_master.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const masterData = await response.json();

    // Fetch species data
    const speciesResponse = await fetch(masterData.data.species);
    const speciesData = await speciesResponse.json();

    // Fetch class data
    const classesResponse = await fetch(masterData.data.classes);
    const classData = await classesResponse.json();

    // Store in global variables for later use
    window.speciesData = speciesData; // Store the full object
    window.classData = classData; // Store the full object
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }

  // Ensure functions from other scripts are available before proceeding
  if (typeof window.setDefaultCharacterName !== 'function') {
    console.error(
      'setDefaultCharacterName() is not defined. Make sure nameGenerator.js is loaded first.'
    );
    return;
  }
  if (typeof window.addCharacter !== 'function') {
    console.error(
      'addCharacter() is not defined. Make sure partyPanel.js is loaded first.'
    );
    return;
  }

  // Get references
  const addCharacterButton = document.getElementById('add-character');
  const characterClassInput = document.getElementById('class-select');
  const characterLevelInput = document.getElementById('character-level');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let classData = {}; // Store class info including images
  let useMaleNames = false;
  let useFemaleNames = false;

  // ✅ Global function to title-case names
  function toTitleCase(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function populateSpeciesDropdown() {
    const speciesDropdown = document.getElementById('species-select');
    if (!speciesDropdown) {
      console.error('Species dropdown element not found!');
      return;
    }

    speciesDropdown.addEventListener('change', () => {
      window.setDefaultCharacterName();
    });

    speciesDropdown.innerHTML = ''; // Clear existing options

    // Check if species data exists
    if (!window.speciesData || !window.speciesData.species) {
      console.error('Species data is missing or incorrect format.');
      return;
    }

    let humanOptionFound = false; // Track if Human is found

    // Format and populate species options
    window.speciesData.species.forEach((species) => {
      const option = document.createElement('option');
      const sourceAcronym =
        species.source?.[0]?.acronym?.toUpperCase() || 'UNKNOWN';
      option.value = species.id;
      option.textContent = `${toTitleCase(species.name)} (${sourceAcronym})`;

      if (species.id.toLowerCase() === 'human') {
        option.selected = true; // Set Human as the default selection
        humanOptionFound = true;
      }

      speciesDropdown.appendChild(option);
    });

    // Log a warning if Human was not found
    if (!humanOptionFound) {
      console.warn('⚠️ Warning: Human species not found in data.');
    }
  }

  function populateClassSelect() {
    const classSelect = document.getElementById('class-select');
    if (!classSelect) {
      console.error('❌ Class select element not found!');
      return;
    }

    // Clear existing options
    classSelect.innerHTML = '';

    // Check if classData is properly loaded
    if (!window.classData || !window.classData.classes) {
      console.error('❌ Class data is missing or incorrectly formatted.');
      return;
    }

    // Populate dropdown with formatted class options
    window.classData.classes.forEach((cls) => {
      const option = document.createElement('option');
      option.value = cls.id;
      option.textContent = `${toTitleCase(cls.name)} (${
        cls.source.find((src) => src.book)?.acronym ||
        cls.source.find((src) => src.web)?.acronym ||
        '??'
      })`;
      classSelect.appendChild(option);
    });

    // Set default class selection to "Fighter" if available
    const defaultClass = classSelect.querySelector('option[value="fighter"]');
    if (defaultClass) {
      defaultClass.selected = true;
    }

    // Trigger image update for the default selection
    updateClassImage(classSelect.value);
  }

  // Function to populate level dropdown
  function populateLevelDropdown() {
    characterLevelInput.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i}`;
      if (i === 5) option.selected = true; // Default to Level 5
      characterLevelInput.appendChild(option);
    }
  }

  // Function to update class image based on selected class
  function updateClassImage(selectedClass) {
    const classImageElement = document.getElementById('class-image');
    if (!classImageElement) {
      console.error('❌ Class image element not found!');
      return;
    }

    // Construct the correct path based on the selected class
    const imagePath = `images/classes/${selectedClass}.svg`;

    // Update the image source
    classImageElement.src = imagePath;
    classImageElement.style.display = 'block'; // Ensure visibility
  }

  // Ensure class image updates when selecting a class
  characterClassInput.addEventListener('change', () => {
    updateClassImage(characterClassInput.value);
  });

  // Toggle gender selection
  function toggleGender(gender) {
    if (gender === 'male') {
      useMaleNames = !useMaleNames;
      useFemaleNames = false;
    } else {
      useFemaleNames = !useFemaleNames;
      useMaleNames = false;
    }

    // Update button styles
    toggleMaleButton.classList.toggle('btn-primary', useMaleNames);
    toggleMaleButton.classList.toggle('btn-secondary', !useMaleNames);
    toggleFemaleButton.classList.toggle('btn-primary', useFemaleNames);
    toggleFemaleButton.classList.toggle('btn-secondary', !useFemaleNames);

    // Ensure the correct name is generated
    window.setDefaultCharacterName();
  }

  // Attach event listeners for gender buttons
  toggleMaleButton.addEventListener('click', () => toggleGender('male'));
  toggleFemaleButton.addEventListener('click', () => toggleGender('female'));

  document
    .getElementById('limit-to-species')
    .addEventListener('click', function () {
      this.classList.toggle('btn-primary');
      this.classList.toggle('btn-secondary');
      this.classList.toggle('active');

      window.setDefaultCharacterName();
    });

  // Modify addCharacter function to include name regeneration
  function addCharacterAndGenerateNewName() {
    window.addCharacter(); // Add character first

    setTimeout(() => {
      window.setDefaultCharacterName(); // Generate new name AFTER adding
    }, 50);
  }

  // Attach event listener to "Add to Party" button
  if (addCharacterButton) {
    addCharacterButton.addEventListener(
      'click',
      addCharacterAndGenerateNewName
    );
  } else {
    console.error('Could not find "Add to Party" button.');
  }

  // Load data and initialize dropdowns
  //generateRandomName();
  populateSpeciesDropdown();
  populateClassSelect();
  populateLevelDropdown();
  setDefaultCharacterName();
});
