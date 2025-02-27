import {
  initializeDatabase,
  loadAllData,
  saveData,
  loadData,
  deleteData,
} from './database.js';
import { showToast } from './toastManager.js';
import { formatText } from './adversaryUI.js';

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

// Populate dropdowns for General data population
async function populateDropdowns() {
  console.log('📌 Populating dropdowns...');
  try {
    const data = await loadAllData();

    updateDropdown('load-party-select', data.parties);
    updateDropdown('load-adversary-select', data.adversaries);
    updateDropdown('load-encounter-select', data.encounters);

    console.log('📌 Adversary Data:', data.adversaries);
    console.log('✅ Dropdowns populated successfully.');

    // ✅ Call these functions without `await` since they are not async
    populatePartyDropdown();
    populateAdversaryDropdown();
    populateEncounterDropdown();
  } catch (error) {
    console.error('❌ Error populating dropdowns:', error);
  }
}

window.updatePartyCalculations = function () {
  const partyLevels = [
    ...document.querySelectorAll('#character-table-body tr td:nth-child(2)'),
  ].map((cell) => parseInt(cell.textContent.trim(), 10) || 1);

  if (partyLevels.length === 0) {
    document.getElementById('average-party-level').textContent = '-';
    document.getElementById('xp-budget').textContent = '-';
    return;
  }

  const totalLevels = partyLevels.reduce((sum, lvl) => sum + lvl, 0);
  const avgLevel = Math.floor(totalLevels / partyLevels.length);

  document.getElementById('average-party-level').textContent = avgLevel;
  document.getElementById('xp-budget').textContent = (
    avgLevel * 100
  ).toLocaleString(); // Example XP calculation
};

function addCharacterToTable(character) {
  const partyList = document.getElementById('character-table-body');
  if (!partyList) {
    console.error('❌ Party table body not found.');
    return;
  }

  const row = document.createElement('tr');
  row.innerHTML = `
        <td>${character.name}</td>
        <td>${character.level}</td>
        <td>${character.species}</td>
        <td>${character.class}</td>
        <td><button class="btn btn-danger btn-sm remove-member">Remove</button></td>
    `;

  partyList.appendChild(row);
  updatePartyCalculations();
}

document
  .getElementById('character-table-body')
  .addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-member')) {
      const row = event.target.closest('tr');
      const name = row.children[0]?.textContent.trim() || 'Unknown';
      const level = row.children[1]?.textContent.trim() || 'Unknown Level';
      const characterClass =
        row.children[3]?.textContent.trim() || 'Unknown Class';

      row.remove();
      updatePartyCalculations();

      // ✅ Ensure removalMessage is always defined
      let removalMessage = `<strong>${name}</strong> has left the party.`;
      if (level !== 'Unknown Level' && characterClass !== 'Unknown Class') {
        removalMessage = `<strong>${name}</strong> the <strong>Level ${level} ${characterClass}</strong> has left the party of adventurers.`;
      }

      showToast(removalMessage, 'danger', 'Party Member Removed', 2500);
    }
  });

// Re-usable function to update a specific dropdown
function updateDropdown(dropdownId, items) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // ✅ Add a default "Select..." option
  dropdown.innerHTML = '<option value="">Select an option...</option>';

  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

// ***** Specific function to populate party dropdown
function populatePartyDropdown() {
  const partySelect = document.getElementById('load-party-select');
  if (!partySelect) {
    console.error('❌ Party dropdown not found!');
    return;
  }

  // Clear existing options
  partySelect.innerHTML = '<option value="">Select a party...</option>';

  // Load party data from IndexedDB
  loadData('parties')
    .then((parties) => {
      if (!parties || parties.length === 0) {
        console.warn('⚠️ No saved parties found.');
        return;
      }

      // Populate dropdown with saved parties
      parties.forEach((party) => {
        const option = document.createElement('option');
        option.value = party.id; // Use party ID as value
        option.textContent = party.name; // Display the party name
        partySelect.appendChild(option);
      });

      console.log('✅ Party dropdown populated successfully.');
    })
    .catch((error) => {
      console.error('❌ Error loading parties:', error);
    });
}

// ***** Specific function to populate adversary dropdown
function populateAdversaryDropdown() {
  const adversarySelect = document.getElementById('load-adversary-select');
  if (!adversarySelect) {
    console.error('❌ Adversary dropdown not found!');
    return;
  }

  // Clear existing options
  adversarySelect.innerHTML =
    '<option value="">Select an adversary group...</option>';

  // Load adversary data from IndexedDB
  loadData('adversaries')
    .then((adversaries) => {
      if (!adversaries || adversaries.length === 0) {
        console.warn('⚠️ No saved adversary groups found.');
        return;
      }

      // Populate dropdown with saved adversaries
      adversaries.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        adversarySelect.appendChild(option);
      });

      console.log('✅ Adversary dropdown populated successfully.');
    })
    .catch((error) => {
      console.error('❌ Error loading adversary groups:', error);
    });
}

// ***** Specific function to populate encounter dropdown
function populateEncounterDropdown() {
  const encounterSelect = document.getElementById('load-encounter-select');
  if (!encounterSelect) {
    console.error('❌ Encounter dropdown not found!');
    return;
  }

  // Clear existing options
  encounterSelect.innerHTML =
    '<option value="">Select an encounter...</option>';

  // Load encounter data from IndexedDB
  loadData('encounters')
    .then((encounters) => {
      if (!encounters || encounters.length === 0) {
        console.warn('⚠️ No saved encounters found.');
        return;
      }

      // Populate dropdown with saved encounters
      encounters.forEach((encounter) => {
        const option = document.createElement('option');
        option.value = encounter.id;
        option.textContent = encounter.name;
        encounterSelect.appendChild(option);
      });

      console.log('✅ Encounter dropdown populated successfully.');
    })
    .catch((error) => {
      console.error('❌ Error loading encounters:', error);
    });
}

// Call this function after the page loads to populate the dropdown
document.addEventListener('DOMContentLoaded', populatePartyDropdown);

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

function updateEncounterXP() {
  const adversaryRows = document.querySelectorAll('#adversary-table-body tr');
  let totalXP = 0;

  adversaryRows.forEach((row) => {
    const quantity = parseInt(row.children[0].textContent.trim(), 10) || 1;
    const xp =
      parseInt(row.children[3].textContent.trim().replace(/,/g, ''), 10) || 0;
    totalXP += quantity * xp;
  });

  document.getElementById('bad-guys-xp').textContent =
    totalXP.toLocaleString();
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
      'Encounter not valid (no party or adversaries). Suppressing output.'
    );
    alert(
      'Please add party members and adversaries before printing an encounter summary.'
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

  // ********** Handle Database "Save" actions **********
  document
    .querySelectorAll('.admin-action-details button.btn-success')
    .forEach((saveBtn) => {
      saveBtn.addEventListener('click', async function () {
        const action = this.closest('.admin-action-details').id.replace(
          '-details',
          ''
        );
        console.log(`💾 Attempting to save: ${action}`);

        let inputField, inputValue;
        if (action === 'save-party') {
          inputField = document.getElementById('save-party-input');
          inputValue = inputField ? inputField.value.trim() : '';
          if (!inputValue)
            return showToast('Please enter a party name.', 'warning');

          const partyMembers = [
            ...document.querySelectorAll('#character-table-body tr'),
          ].map((row) => {
            const cells = row.querySelectorAll('td');
            return {
              name: cells[0]?.textContent.trim() || 'Unknown',
              level: parseInt(cells[1]?.textContent.trim(), 10) || 1,
              species: cells[2]?.textContent.trim() || 'Unknown',
              class: cells[3]?.textContent.trim() || 'Unknown',
            };
          });

          await saveData('parties', {
            id: crypto.randomUUID(),
            name: inputValue,
            members: partyMembers,
          });
          showToast(`✅ Party '${inputValue}' saved successfully.`, 'success');
        } else if (action === 'save-adversary') {
          inputField = document.getElementById('save-adversary-input');
          inputValue = inputField ? inputField.value.trim() : '';
          if (!inputValue)
            return showToast(
              '⚠️ Please enter an adversary group name.',
              'warning'
            );

          const adversaryList = [
            ...document.querySelectorAll('#adversary-table-body tr'),
          ].map((row) => {
            const cells = row.querySelectorAll('td');
            return {
              name: cells[1]?.textContent.trim() || 'Unknown',
              cr: cells[2]?.textContent.trim() || 'Unknown',
              xp: cells[3]?.textContent.trim() || 'Unknown',
              quantity: parseInt(cells[0]?.textContent.trim(), 10) || 1,
            };
          });

          await saveData('adversaries', {
            id: crypto.randomUUID(),
            name: inputValue,
            adversaries: adversaryList, // Save the list of adversaries
          });

          showToast(
            `✅ Adversary group '${inputValue}' saved successfully.`,
            'success'
          );
        } else if (action === 'save-encounter') {
          inputField = document.getElementById('save-encounter-input');
          inputValue = inputField ? inputField.value.trim() : '';
          if (!inputValue)
            return showToast('⚠️ Please enter an encounter name.', 'warning');

          const partyMembers = [
            ...document.querySelectorAll('#character-table-body tr'),
          ].map((row) => {
            const cells = row.querySelectorAll('td');
            return {
              name: cells[0]?.textContent.trim() || 'Unknown',
              level: parseInt(cells[1]?.textContent.trim(), 10) || 1,
              species: cells[2]?.textContent.trim() || 'Unknown',
              class: cells[3]?.textContent.trim() || 'Unknown',
            };
          });

          const adversaryList = [
            ...document.querySelectorAll('#adversary-table-body tr'),
          ].map((row) => {
            const cells = row.querySelectorAll('td');
            return {
              name: cells[1]?.textContent.trim() || 'Unknown',
              cr: cells[2]?.textContent.trim() || 'Unknown',
              xp: cells[3]?.textContent.trim() || 'Unknown',
              quantity: parseInt(cells[0]?.textContent.trim(), 10) || 1,
            };
          });

          await saveData('encounters', {
            id: crypto.randomUUID(),
            name: inputValue,
            party: partyMembers,
            adversaries: adversaryList, // Save adversaries too!
          });

          showToast(
            `✅ Encounter '${inputValue}' saved successfully.`,
            'success'
          );
        }

        // Clear the input field after saving
        if (inputField) inputField.value = '';

        // Close the panel after saving
        document
          .querySelectorAll('.admin-action-details')
          .forEach((panel) => panel.classList.add('d-none'));

        // Reset active buttons
        document
          .querySelectorAll('#admin-btn-group .dropdown-toggle')
          .forEach((btn) => {
            btn.classList.remove('btn-primary', 'active');
            btn.classList.add('btn-secondary');
          });
      });
    });
  // ********** End Handle Database "Save" actions **********

  // ********** Handle Document "Load" Party Actions **********
  document
    .getElementById('load-party-details')
    .addEventListener('click', async function (event) {
      if (
        event.target.tagName === 'BUTTON' &&
        event.target.textContent === 'Load'
      ) {
        const partySelect = document.getElementById('load-party-select');
        const partyId = partySelect.value;

        if (!partyId) {
          showToast('⚠️ Please select a party to load.', 'warning');
          return;
        }

        console.log(`📌 Loading party with ID: ${partyId}`);

        try {
          const partyData = await loadData('parties', partyId);
          if (!partyData) {
            showToast('❌ Failed to load party. Data not found.', 'error');
            return;
          }

          // Confirmation if a party is already loaded
          if (
            document.querySelectorAll('#character-table-body tr').length > 0
          ) {
            if (
              !confirm(
                '⚠️ Loading this party will replace the current list. Continue?'
              )
            ) {
              return;
            }
          }

          // Clear current party
          document.getElementById('character-table-body').innerHTML = '';

          // Add loaded characters to the table
          partyData.members.forEach((member) => addCharacterToTable(member));

          // Update calculations
          updatePartyCalculations();

          showToast(
            `✅ Party '${partyData.name}' loaded successfully.`,
            'success'
          );

          console.log('✅ Party loaded:', partyData);
        } catch (error) {
          console.error('❌ Error loading party:', error);
          showToast(
            '❌ Error loading party. See console for details.',
            'error'
          );
        }
      }
    });

  // Remove Adversary (Event Delegation)
  document
    .getElementById('adversary-table-body')
    .addEventListener('click', function (event) {
      if (event.target.classList.contains('remove-adversary')) {
        const row = event.target.closest('tr');
        const name = row.children[1]?.textContent.trim();
        const quantityCell = row.children[0];
        let quantity = parseInt(quantityCell.textContent.trim(), 10) || 1;
        const xp =
          parseInt(
            row.children[3]?.textContent.trim().replace(/,/g, ''),
            10
          ) || 0;

        if (quantity > 1) {
          // ✅ Reduce the quantity instead of removing the row
          quantity -= 1;
          quantityCell.textContent = quantity;

          showToast(
            `<strong>${formatText(
              name
            )}</strong> count on the Adversary List has decreased to 
		      <strong>${quantity}</strong>, removing 
		      <strong>${xp.toLocaleString()} XP</strong> from the Encounter for an easier challenge.`,
            'danger',
            'Adversary Decrease',
            2500
          );
        } else {
          // ✅ If only one remains, remove the row completely
          row.remove();

          showToast(
            `The last <strong>${formatText(
              name
            )}</strong> has been removed from the Encounter decreasing the challenge by ${xp.toLocaleString()} XP.`,
            'danger',
            'Adversary Removed',
            2500
          );
        }

        updateEncounterXP(); // ✅ Update XP after removal
      }
    });

  // ********** Handle Document "Adversary" Party Actions **********
  document
    .getElementById('load-adversary-details')
    .addEventListener('click', async function (event) {
      if (
        event.target.tagName === 'BUTTON' &&
        event.target.textContent === 'Load'
      ) {
        const adversarySelect = document.getElementById(
          'load-adversary-select'
        );
        const adversaryId = adversarySelect.value;

        if (!adversaryId) {
          showToast('⚠️ Please select an adversary group to load.', 'warning');
          return;
        }

        console.log(`📌 Loading adversary group with ID: ${adversaryId}`);

        try {
          const adversaryData = await loadData('adversaries', adversaryId);
          if (!adversaryData) {
            showToast(
              '❌ Failed to load adversary group. Data not found.',
              'error'
            );
            return;
          }

          // Confirm if replacing existing adversary group
          if (
            document.querySelectorAll('#adversary-table-body tr').length > 0
          ) {
            if (
              !confirm(
                '⚠️ Loading this adversary group will replace the current list. Continue?'
              )
            ) {
              return;
            }
          }

          // Clear existing adversaries
          document.getElementById('adversary-table-body').innerHTML = '';

          // Populate adversary table
          adversaryData.adversaries.forEach((adv) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${adv.quantity}</td>
              <td>${adv.name}</td>
              <td>${adv.cr}</td>
              <td>${adv.xp}</td>
              <td><button class="btn btn-danger btn-sm remove-adversary">Remove</button></td>
            `;

            document.getElementById('adversary-table-body').appendChild(row);
          });

          updateEncounterXP();

          showToast(
            `✅ Adversary Group '${adversaryData.name}' loaded successfully.`,
            'success'
          );
          console.log('✅ Adversary group loaded:', adversaryData);
        } catch (error) {
          console.error('❌ Error loading adversary group:', error);
          showToast(
            '❌ Error loading adversary group. See console for details.',
            'error'
          );
        }
      }
    });

  // ********** Handle Document "Load" Encounter Actions **********

  // ✅ Load Encounter (Loads both Party & Adversaries)
  document
    .getElementById('load-encounter-details')
    .addEventListener('click', async function (event) {
      if (
        event.target.tagName === 'BUTTON' &&
        event.target.textContent === 'Load'
      ) {
        const encounterSelect = document.getElementById(
          'load-encounter-select'
        );
        const encounterId = encounterSelect.value;

        if (!encounterId) {
          showToast('⚠️ Please select an encounter to load.', 'warning');
          return;
        }

        console.log(`📌 Loading encounter with ID: ${encounterId}`);

        try {
          const encounterData = await loadData('encounters', encounterId);
          if (!encounterData) {
            showToast('❌ Failed to load encounter. Data not found.', 'error');
            return;
          }

          // Confirm if replacing existing party and adversaries
          if (
            document.querySelectorAll('#character-table-body tr').length > 0 ||
            document.querySelectorAll('#adversary-table-body tr').length > 0
          ) {
            if (
              !confirm(
                '⚠️ Loading this encounter will replace the current lists. Continue?'
              )
            ) {
              return;
            }
          }

          // Clear existing party and adversaries
          document.getElementById('character-table-body').innerHTML = '';
          document.getElementById('adversary-table-body').innerHTML = '';

          // ✅ Load Party Members
          if (encounterData.party && encounterData.party.length > 0) {
            encounterData.party.forEach((member) =>
              addCharacterToTable(member)
            );
          }

          // ✅ Load Adversaries
          if (
            encounterData.adversaries &&
            encounterData.adversaries.length > 0
          ) {
            encounterData.adversaries.forEach((adv) => {
              const row = document.createElement('tr');
              row.innerHTML = `
              <td>${adv.quantity}</td>
              <td>${adv.name}</td>
              <td>${adv.cr}</td>
              <td>${adv.xp}</td>
              <td><button class="btn btn-danger btn-sm remove-adversary">Remove</button></td>
            `;
              document.getElementById('adversary-table-body').appendChild(row);
            });
          }

          // ✅ Update XP and Party Budget
          updateEncounterXP();
          updatePartyCalculations();

          showToast(
            `✅ Encounter '${encounterData.name}' loaded successfully.`,
            'success'
          );
          console.log('✅ Encounter loaded:', encounterData);
        } catch (error) {
          console.error('❌ Error loading encounter:', error);
          showToast(
            '❌ Error loading encounter. See console for details.',
            'error'
          );
        }
      }
    });
});
