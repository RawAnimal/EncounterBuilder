function getEncounterDescription(index) {
  if (!encounterMessagesEnabled) {
    return ''; // Feature is disabled, return empty string
  }

  let tone = selectedTone;

  // ✅ If "random" is selected, pick a random tone from available keys
  if (tone === 'random') {
    const availableTones = Object.keys(encounterMessages);
    if (availableTones.length > 0) {
      tone = availableTones[Math.floor(Math.random() * availableTones.length)];
    } else {
      tone = 'classic'; // Fallback if no tones are loaded
    }
  }

  // Ensure the correct structure
  if (!encounterMessages || !encounterMessages[tone]) {
    console.warn(
      `Encounter tone "${tone}" not found. Defaulting to "classic".`
    );
    tone = 'classic';
  }

  // Convert difficulty index to an integer to match JSON keys
  const difficultyKey = Math.round(index).toString();

  // ✅ Select a random message from the array if multiple exist
  const messages = encounterMessages[tone][difficultyKey];
  if (Array.isArray(messages) && messages.length > 0) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  return '⚠️ No description available.';
}

// Feature toggle: Set to false to disable encounter messages
const encounterMessagesEnabled = true;

// Tone selection: Choose "classic", "casual", "grimdark", or "random"
let selectedTone = 'random';

// Variable to store loaded encounter messages
let encounterMessages = {};

// Function to load messages through dnd_2024_master.json
async function loadEncounterMessages() {
  try {
    const response = await fetch('data/datasets/encounter_messages.json');
    const data = await response.json();

    if (data.encounter_messages) {
      encounterMessages = data.encounter_messages; // ✅ Now correctly accesses messages
    } else {
      console.warn(
        '⚠️ No encounter messages found in encounter_messages.json.'
      );
    }
  } catch (error) {
    console.error('Error loading encounter messages:', error);
  }
}

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

    await loadEncounterMessages();
  } catch (error) {
    console.error('Error loading data:', error);
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
      console.warn('Warning: Human species not found in data.');
    }
  }

  function populateClassSelect() {
    const classSelect = document.getElementById('class-select');
    if (!classSelect) {
      console.error('Class select element not found!');
      return;
    }

    // Clear existing options
    classSelect.innerHTML = '';

    // Check if classData is properly loaded
    if (!window.classData || !window.classData.classes) {
      console.error('Class data is missing or incorrectly formatted.');
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
      console.error('Class image element not found!');
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

  const printButton = document.getElementById('print-encounter');
  const printSection = document.getElementById('print-summary');

  function getAveragePartyLevel() {
    const partyLevels = [
      ...document.querySelectorAll('#character-table-body tr td:nth-child(2)'),
    ].map((cell) => parseInt(cell.textContent.trim(), 10) || 1);

    if (partyLevels.length === 0) return 1; // Default to level 1 if no data

    const totalLevels = partyLevels.reduce((sum, lvl) => sum + lvl, 0);
    return Math.floor(totalLevels / partyLevels.length);
  }

  if (printButton) {
    printButton.addEventListener('click', async () => {
      // Ensure fonts and JSON data are fully loaded before printing
      await document.fonts.ready;

      // Select print sections
      const printSection = document.getElementById('print-summary'); // Main print layout
      const printEvaluation = document.getElementById('print-evaluation'); // Encounter evaluation

      if (!printSection || !printEvaluation) {
        console.error('Error: Missing one or more print sections in HTML.');
        return;
      }

      // ✅ Check if messages are disabled and hide the evaluation section if so
      if (!encounterMessagesEnabled) {
        printEvaluation.style.display = 'none'; // Hide encounter evaluation
        console.warn(
          '⚠️ Encounter messages are disabled. Hiding Encounter Evaluation.'
        );
      } else {
        printEvaluation.style.display = 'block'; // Show if enabled
      }

      // ✅ Function to get the selected encounter difficulty from the UI
      function getSelectedDifficulty() {
        const activeButton = document.querySelector(
          '#encounter-difficulty .active'
        );
        return activeButton ? activeButton.textContent.trim() : 'Unknown';
      }

      // Get elements safely
      const partyLevelElement = document.getElementById('average-party-level');
      const encounterXpElement = document.getElementById('bad-guys-xp');
      const xpBudgetElement = document.getElementById('xp-budget');
      const encounterBalanceElement =
        document.getElementById('encounter-balance');

      if (
        !partyLevelElement ||
        !encounterXpElement ||
        !xpBudgetElement ||
        !encounterBalanceElement
      ) {
        console.error(
          '❌ Missing one or more required elements for encounter calculation.'
        );
        return;
      }

      // Extract values safely
      const averagePartyLevel =
        parseInt(partyLevelElement.textContent.trim(), 10) || 1;
      const encounterXp =
        parseInt(
          encounterXpElement.textContent.replace(/,/g, '').trim(),
          10
        ) || 0;
      const xpBudget =
        parseInt(xpBudgetElement.textContent.replace(/,/g, '').trim(), 10) ||
        0;
      const encounterBalance =
        parseInt(
          encounterBalanceElement.textContent.replace(/,/g, '').trim(),
          10
        ) || 0;

      // If all values are zero, prevent message from displaying
      if (encounterXp === 0 && xpBudget === 0) {
        console.warn(
          '⚠️ Encounter not valid (no party or adversaries). Suppressing output.'
        );
        alert(
          '⚠️ Please add party members and adversaries before printing an encounter summary.'
        );
        return;
      }

      // Calculate difficulty rating (for message generation)
      const scalingFactor = 2 + (10 - Math.min(10, averagePartyLevel)) / 2;
      const difficultyIndex =
        xpBudget > 0
          ? Math.max(
              0,
              Math.min(
                10,
                6 + ((encounterXp - xpBudget) / xpBudget) * scalingFactor
              )
            )
          : 0;

      // Ensure function exists before calling
      if (typeof getEncounterDescription !== 'function') {
        console.error(
          'Function getEncounterDescription() is missing or not loaded!'
        );
        return;
      }

      // Get the encounter feedback text (unchanged calculation)
      const encounterFeedback = getEncounterDescription(difficultyIndex);

      // ✅ Get the selected difficulty from UI instead of using calculated difficulty
      const difficultyText = getSelectedDifficulty();

      // ✅ Populate print summary values
      document.getElementById('print-difficulty').textContent = difficultyText;
      document.getElementById('print-xp-budget').textContent =
        xpBudget.toLocaleString();
      document.getElementById('print-encounter-xp').textContent =
        encounterXp.toLocaleString();
      document.getElementById('print-balance').textContent =
        encounterBalance.toLocaleString();

      // ✅ Apply color coding to balance
      const printBalanceElement = document.getElementById('print-balance');
      if (encounterBalance > 0) {
        printBalanceElement.style.color = 'green';
      } else if (encounterBalance < 0) {
        printBalanceElement.style.color = 'red';
      } else {
        printBalanceElement.style.color = 'black';
      }

      // ✅ Copy party members to print summary (removes button columns)
      const partyTable = document.getElementById('character-table-body');
      const printPartyTable = document
        .getElementById('print-party')
        .querySelector('tbody');
      printPartyTable.innerHTML = ''; // Clear before inserting

      partyTable.querySelectorAll('tr').forEach((row) => {
        const clonedRow = row.cloneNode(true);
        clonedRow
          .querySelectorAll('td:last-child')
          .forEach((td) => td.remove()); // Remove last column (buttons)
        printPartyTable.appendChild(clonedRow);
      });

      // ✅ Copy adversaries to print summary (removes buttons and swaps columns)
      const adversaryTable = document.getElementById('adversary-table-body');
      const printAdversaryTable = document
        .getElementById('print-adversaries')
        .querySelector('tbody');
      printAdversaryTable.innerHTML = ''; // Clear before inserting

      adversaryTable.querySelectorAll('tr').forEach((row) => {
        const clonedRow = row.cloneNode(true);
        const cells = clonedRow.querySelectorAll('td');

        if (cells.length >= 4) {
          // Swap Quantity (originally first) and Name (originally second)
          const quantityCell = cells[0].cloneNode(true);
          const nameCell = cells[1].cloneNode(true);

          cells[0].replaceWith(nameCell);
          cells[1].replaceWith(quantityCell);
        }

        // Remove last column (buttons)
        clonedRow
          .querySelectorAll('td:last-child')
          .forEach((td) => td.remove());
        printAdversaryTable.appendChild(clonedRow);
      });

      // ✅ Populate the encounter feedback box
      document.getElementById('print-encounter-feedback').textContent =
        encounterFeedback;

      // Show print summary before printing
      printSection.style.display = 'block';

      // Wait 200ms to ensure styles apply before printing
      setTimeout(() => {
        window.print();
      }, 200);

      // Hide the print summary after printing
      setTimeout(() => {
        printSection.style.display = 'none';
      }, 700);
    });
  }

  // Load data and initialize dropdowns
  populateSpeciesDropdown();
  populateClassSelect();
  populateLevelDropdown();
  setDefaultCharacterName();
});
