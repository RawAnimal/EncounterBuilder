import { initializeDatabase, loadAllData } from './database.js';

// Global variables and settings
let encounterMessages = {};
const encounterMessagesEnabled = true; // Feature toggle for encounter messages
let selectedTone = 'random'; // Tone selection: "classic", "casual", "grimdark", or "random"
let useMaleNames = false;
let useFemaleNames = false;

// Initialize the database, then populate UI elements
initializeDatabase()
  .then(() => {
    console.log('✅ IndexedDB initialized successfully.');
    populateDropdowns();
  })
  .catch(console.error);

// Populate dropdowns for loading saved data
async function populateDropdowns() {
  console.log('📌 Populating dropdowns...');
  try {
    const data = await loadAllData();
    updateDropdown('party-list', data.parties);
    updateDropdown('adversary-list', data.adversaries);
    updateDropdown('encounter-list', data.encounters);
    console.log('✅ Dropdowns populated successfully.');
  } catch (error) {
    console.error('❌ Error populating dropdowns:', error);
  }
}

function updateDropdown(dropdownId, items) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  dropdown.innerHTML = '';
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

// Get encounter description based on difficulty
function getEncounterDescription(index) {
  if (!encounterMessagesEnabled) {
    return ''; // Feature is disabled, return empty string
  }

  let tone = selectedTone;

  // If "random" is selected, pick a random tone from available keys
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

  // Select a random message from the array if multiple exist
  const messages = encounterMessages[tone][difficultyKey];
  if (Array.isArray(messages) && messages.length > 0) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  return '⚠️ No description available.';
}

// Load encounter messages from JSON
async function loadEncounterMessages() {
  try {
    const response = await fetch('data/datasets/encounter_messages.json');
    const data = await response.json();

    if (data.encounter_messages) {
      encounterMessages = data.encounter_messages;
    } else {
      console.warn(
        '⚠️ No encounter messages found in encounter_messages.json.'
      );
    }
  } catch (error) {
    console.error('Error loading encounter messages:', error);
  }
}

// Title case utility function
function toTitleCase(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Main initialization function
window.addEventListener('load', async () => {
  try {
    // Load master data file
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
    window.speciesData = speciesData;
    window.classData = classData;

    // Load encounter messages
    await loadEncounterMessages();

    // Ensure required functions are available
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

    // Initialize UI elements and attach event listeners
    initializeUIElements();
  } catch (error) {
    console.error('Error loading data:', error);
  }
});

// Initialize UI elements and attach event handlers
function initializeUIElements() {
  // Get references to UI elements
  const addCharacterButton = document.getElementById('add-character');
  const characterClassInput = document.getElementById('class-select');
  const characterLevelInput = document.getElementById('character-level');
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');
  const printButton = document.getElementById('print-encounter');

  // Populate dropdowns
  populateSpeciesDropdown();
  populateClassSelect();
  populateLevelDropdown();

  // Set default character name
  if (typeof window.setDefaultCharacterName === 'function') {
    window.setDefaultCharacterName();
  }

  // Initialize class image
  if (characterClassInput) {
    updateClassImage(characterClassInput.value);
    characterClassInput.addEventListener('change', () => {
      updateClassImage(characterClassInput.value);
    });
  }

  // Attach gender toggle event listeners
  if (toggleMaleButton && toggleFemaleButton) {
    toggleMaleButton.addEventListener('click', () => toggleGender('male'));
    toggleFemaleButton.addEventListener('click', () => toggleGender('female'));
  }

  // Attach species limiting event listener
  const limitToSpeciesButton = document.getElementById('limit-to-species');
  if (limitToSpeciesButton) {
    limitToSpeciesButton.addEventListener('click', function () {
      this.classList.toggle('btn-primary');
      this.classList.toggle('btn-secondary');
      this.classList.toggle('active');

      if (typeof window.setDefaultCharacterName === 'function') {
        window.setDefaultCharacterName();
      }
    });
  }

  // Attach add character event listener
  if (addCharacterButton) {
    addCharacterButton.addEventListener(
      'click',
      addCharacterAndGenerateNewName
    );
  } else {
    console.error('Could not find "Add to Party" button.');
  }

  // Attach print button event listener
  if (printButton) {
    printButton.addEventListener('click', handlePrintButtonClick);
  }
}

// Populate species dropdown
function populateSpeciesDropdown() {
  const speciesDropdown = document.getElementById('species-select');
  if (!speciesDropdown) {
    console.error('Species dropdown element not found!');
    return;
  }

  speciesDropdown.addEventListener('change', () => {
    if (typeof window.setDefaultCharacterName === 'function') {
      window.setDefaultCharacterName();
    }
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

// Populate class dropdown
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
}

// Populate level dropdown
function populateLevelDropdown() {
  const characterLevelInput = document.getElementById('character-level');
  if (!characterLevelInput) {
    console.error('Character level input not found!');
    return;
  }

  characterLevelInput.innerHTML = '';

  for (let i = 1; i <= 20; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${i}`;
    if (i === 5) option.selected = true; // Default to Level 5
    characterLevelInput.appendChild(option);
  }
}

// Update class image based on selection
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

// Toggle gender selection
function toggleGender(gender) {
  const toggleMaleButton = document.getElementById('toggle-male');
  const toggleFemaleButton = document.getElementById('toggle-female');

  if (!toggleMaleButton || !toggleFemaleButton) {
    console.error('Gender toggle buttons not found!');
    return;
  }

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
  if (typeof window.setDefaultCharacterName === 'function') {
    window.setDefaultCharacterName();
  }
}

// Add character and generate new name
function addCharacterAndGenerateNewName() {
  if (typeof window.addCharacter === 'function') {
    window.addCharacter(); // Add character first

    setTimeout(() => {
      if (typeof window.setDefaultCharacterName === 'function') {
        window.setDefaultCharacterName(); // Generate new name AFTER adding
      }
    }, 50);
  } else {
    console.error('addCharacter function is not available');
  }
}

// Get average party level
function getAveragePartyLevel() {
  const partyLevels = [
    ...document.querySelectorAll('#character-table-body tr td:nth-child(2)'),
  ].map((cell) => parseInt(cell.textContent.trim(), 10) || 1);

  if (partyLevels.length === 0) return 1; // Default to level 1 if no data

  const totalLevels = partyLevels.reduce((sum, lvl) => sum + lvl, 0);
  return Math.floor(totalLevels / partyLevels.length);
}

// Get selected difficulty from UI
function getSelectedDifficulty() {
  const activeButton = document.querySelector('#encounter-difficulty .active');
  return activeButton ? activeButton.textContent.trim() : 'Unknown';
}

// Handle print button click
async function handlePrintButtonClick() {
  // Ensure fonts and JSON data are fully loaded before printing
  await document.fonts.ready;

  // Select print sections
  const printSection = document.getElementById('print-summary'); // Main print layout
  const printEvaluation = document.getElementById('print-evaluation'); // Encounter evaluation

  if (!printSection || !printEvaluation) {
    console.error('Error: Missing one or more print sections in HTML.');
    return;
  }

  // Check if messages are disabled and hide the evaluation section if so
  if (!encounterMessagesEnabled) {
    printEvaluation.style.display = 'none'; // Hide encounter evaluation
    console.warn(
      '⚠️ Encounter messages are disabled. Hiding Encounter Evaluation.'
    );
  } else {
    printEvaluation.style.display = 'block'; // Show if enabled
  }

  // Get elements safely
  const partyLevelElement = document.getElementById('average-party-level');
  const encounterXpElement = document.getElementById('bad-guys-xp');
  const xpBudgetElement = document.getElementById('xp-budget');
  const encounterBalanceElement = document.getElementById('encounter-balance');

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
    parseInt(encounterXpElement.textContent.replace(/,/g, '').trim(), 10) || 0;
  const xpBudget =
    parseInt(xpBudgetElement.textContent.replace(/,/g, '').trim(), 10) || 0;
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

  // Get the encounter feedback text
  const encounterFeedback = getEncounterDescription(difficultyIndex);

  // Get the selected difficulty from UI
  const difficultyText = getSelectedDifficulty();

  // Populate print summary values
  document.getElementById('print-difficulty').textContent = difficultyText;
  document.getElementById('print-xp-budget').textContent =
    xpBudget.toLocaleString();
  document.getElementById('print-encounter-xp').textContent =
    encounterXp.toLocaleString();
  document.getElementById('print-balance').textContent =
    encounterBalance.toLocaleString();

  // Apply color coding to balance
  const printBalanceElement = document.getElementById('print-balance');
  if (encounterBalance > 0) {
    printBalanceElement.style.color = 'green';
  } else if (encounterBalance < 0) {
    printBalanceElement.style.color = 'red';
  } else {
    printBalanceElement.style.color = 'black';
  }

  // Copy party members to print summary (removes button columns)
  const partyTable = document.getElementById('character-table-body');
  const printPartyTable = document
    .getElementById('print-party')
    .querySelector('tbody');
  if (partyTable && printPartyTable) {
    printPartyTable.innerHTML = ''; // Clear before inserting

    partyTable.querySelectorAll('tr').forEach((row) => {
      const clonedRow = row.cloneNode(true);
      clonedRow.querySelectorAll('td:last-child').forEach((td) => td.remove()); // Remove last column (buttons)
      printPartyTable.appendChild(clonedRow);
    });
  }

  // Copy adversaries to print summary (removes buttons and swaps columns)
  const adversaryTable = document.getElementById('adversary-table-body');
  const printAdversaryTable = document
    .getElementById('print-adversaries')
    .querySelector('tbody');
  if (adversaryTable && printAdversaryTable) {
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
      clonedRow.querySelectorAll('td:last-child').forEach((td) => td.remove());
      printAdversaryTable.appendChild(clonedRow);
    });
  }

  // Populate the encounter feedback box
  const feedbackElement = document.getElementById('print-encounter-feedback');
  if (feedbackElement) {
    feedbackElement.textContent = encounterFeedback;
  }

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
}

document.addEventListener('DOMContentLoaded', () => {
  const adminButton = document.getElementById('admin-view');
  const adminPanel = document.getElementById('encounter-admin');

  if (adminButton && adminPanel) {
    adminButton.addEventListener('click', () => {
      const isActive = adminButton.classList.contains('btn-primary');
      adminButton.classList.toggle('btn-primary', !isActive);
      adminButton.classList.toggle('btn-secondary', isActive);
      adminButton.classList.toggle('active', !isActive);
      adminPanel.classList.toggle('d-none', isActive);
    });
  } else {
    console.error('Admin button or admin panel not found.');
  }

  document.querySelectorAll('.admin-action').forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent page jump

      const action = this.getAttribute('data-action');
      console.log(`📌 Admin action triggered: ${action}`);

      // Get the button associated with the clicked option
      const button =
        this.closest('.btn-group').querySelector('.dropdown-toggle');

      // Remove 'btn-primary active' from all buttons first
      document
        .querySelectorAll('#admin-btn-group .dropdown-toggle')
        .forEach((btn) => {
          btn.classList.remove('btn-primary', 'active');
          btn.classList.add('btn-secondary');
        });

      // Hide all admin panels
      document.querySelectorAll('.admin-action-details').forEach((panel) => {
        panel.classList.add('d-none');
      });

      // If a 'clear' action is selected, perform the action and exit
      if (action.startsWith('clear-')) {
        handleClearAction(action);
        return;
      }

      // Show the corresponding panel
      const panel = document.getElementById(`${action}-details`);
      if (!panel) {
        console.error(`❌ Panel with ID '${action}-details' not found.`);
        return;
      }
      panel.classList.remove('d-none');

      // Set the button to active while its panel is visible
      if (button) {
        button.classList.remove('btn-secondary');
        button.classList.add('btn-primary', 'active');
      }

      // Collapse the dropdown menu immediately
      const dropdown = this.closest('.dropdown');
      if (dropdown) {
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
          bootstrap.Dropdown.getOrCreateInstance(dropdownToggle).hide();
        }
      }
    });
  });

  // Handle "Cancel" button in admin panels
  document.querySelectorAll('.cancel-admin-action').forEach((cancelBtn) => {
    cancelBtn.addEventListener('click', function () {
      console.log('❌ Admin panel action cancelled.');

      // Hide all admin panels
      document.querySelectorAll('.admin-action-details').forEach((panel) => {
        panel.classList.add('d-none');
      });

      // Reset buttons back to inactive
      document
        .querySelectorAll('#admin-btn-group .dropdown-toggle')
        .forEach((btn) => {
          btn.classList.remove('btn-primary', 'active');
          btn.classList.add('btn-secondary');
        });
    });
  });
});
