document.addEventListener('DOMContentLoaded', () => {
  const characterClassInput = document.getElementById('character-class');
  const characterLevelInput = document.getElementById('character-level');
  const addCharacterButton = document.getElementById('add-character');
  const characterTableBody = document.getElementById('character-table-body');

  let characters = [];

  // Function to show toast notification
  function showToast(message, type = 'success') {
    const toastElement = document.getElementById('notification-toast');
    const toastBody = document.getElementById('toast-message');

    // Update message and background color based on type
    toastBody.textContent = message;
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;

    // Show the toast using Bootstrap's Toast class
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Load classes from JSON file
  async function loadClasses() {
    try {
      const response = await fetch('data/classes.json'); // Make sure this file exists
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
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

  // Function to add a character to the party list
  function addCharacter() {
    const name = document.getElementById('character-name').value.trim();
    const characterClass = characterClassInput.value;
    const level = characterLevelInput.value;

    if (!name) {
      alert('Please enter a character name.');
      return;
    }

    const character = { name, characterClass, level };
    characters.push(character);
    updatePartyTable();

    // Show success toast notification
    showToast(`${name} has been added to the party!`);
  }

  // Function to update the party table
  function updatePartyTable() {
    characterTableBody.innerHTML = '';

    characters.forEach((character, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${character.name}</td>
                <td>Level ${character.level}</td>
                <td>${character.characterClass}</td>
                <td class="text-end"><button class="btn btn-danger btn-sm remove-character" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button></td>
            `;
      characterTableBody.appendChild(row);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-character').forEach((button) => {
      button.addEventListener('click', (event) => {
        const index = event.target.closest('button').dataset.index;
        const removedCharacter = characters[index];
        characters.splice(index, 1);
        updatePartyTable();

        // Show toast notification for character removal
        showToast(
          `${removedCharacter.name} has been removed from the party!`,
          'danger'
        );
      });
    });
  }

  // Attach event listener to Add Character button
  addCharacterButton.addEventListener('click', addCharacter);

  // Initialize dropdowns and load data
  populateLevelDropdown();
  loadClasses();
});
