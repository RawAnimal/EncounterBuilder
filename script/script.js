window.addEventListener('load', () => {
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
  const characterClassInput = document.getElementById('character-class');
  const characterLevelInput = document.getElementById('character-level'); // Level dropdown
  const classImageElement = document.getElementById('class-image'); // Class image
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let classData = {}; // Store class info including images
  let useMaleNames = false;
  let useFemaleNames = false;

  // Load class data from JSON file
  async function loadClassData() {
    try {
      const response = await fetch('data/classes.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      classData = {};

      // Clear existing dropdown options
      characterClassInput.innerHTML = '';

      data.classes.forEach((cls) => {
        classData[cls.name] = cls.image; // Store image path
        const option = document.createElement('option');
        option.value = cls.name;
        option.textContent = cls.name;
        characterClassInput.appendChild(option);
      });

      // Set initial image
      updateClassImage(characterClassInput.value);
    } catch (error) {
      console.error('Error loading class data:', error);
    }
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
    if (classData[selectedClass]) {
      classImageElement.src = classData[selectedClass];
      classImageElement.style.display = 'block'; // Ensure it's visible
    } else {
      classImageElement.style.display = 'none';
    }
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

  // Load class data and initialize dropdowns
  loadClassData();
  populateLevelDropdown(); // Ensure level dropdown is populated
});
