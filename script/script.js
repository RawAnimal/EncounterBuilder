window.addEventListener('load', () => {
  console.log('script.js loaded successfully.');

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

  // Get reference to buttons and input
  const addCharacterButton = document.getElementById('add-character');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  let useMaleNames = false;
  let useFemaleNames = false;

  // Populate class dropdown
  function populateClassDropdown() {
    const characterClassInput = document.getElementById('character-class');
    const classes = [
      'Barbarian',
      'Bard',
      'Cleric',
      'Druid',
      'Fighter',
      'Monk',
      'Paladin',
      'Ranger',
      'Rogue',
      'Sorcerer',
      'Warlock',
      'Wizard',
    ];

    characterClassInput.innerHTML = '';
    classes.forEach((className) => {
      const option = document.createElement('option');
      option.value = className;
      option.textContent = className;
      characterClassInput.appendChild(option);
    });

    console.log('Class dropdown initialized.');
  }

  // Populate level dropdown
  function populateLevelDropdown() {
    const characterLevelInput = document.getElementById('character-level');
    characterLevelInput.innerHTML = '';

    for (let i = 1; i <= 20; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `Level ${i}`;
      if (i === 5) option.selected = true;
      characterLevelInput.appendChild(option);
    }

    console.log('Level dropdown initialized.');
  }

  // Ensure dropdowns are populated when the page loads
  populateClassDropdown();
  populateLevelDropdown();

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
    console.log(
      `Gender toggled: Male(${useMaleNames}) Female(${useFemaleNames})`
    );
  }

  // Attach event listeners for gender buttons
  toggleMaleButton.addEventListener('click', () => toggleGender('male'));
  toggleFemaleButton.addEventListener('click', () => toggleGender('female'));

  // Modify addCharacter function to include name regeneration
  function addCharacterAndGenerateNewName() {
    window.addCharacter(); // Add character first

    setTimeout(() => {
      window.setDefaultCharacterName(); // Generate new name AFTER adding
      console.log('New name generated after adding character.');
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
});
