import { showToast } from './toastManager.js';
import { initializeTooltip } from './tooltipManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const characterClassInput = document.getElementById('class-select');
  const characterLevelInput = document.getElementById('character-level');
  const characterTableBody = document.getElementById('character-table-body');

  let characters = [];

  // ✅ Function to Capitalize First Letter of Words
  function capitalizeFirstLetter(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Function to add a character to the party list
  function addCharacter() {
    const name = document.getElementById('character-name').value.trim();
    const characterClass = characterClassInput.value;
    const level = characterLevelInput.value;
    const species = document.getElementById('species-select').value;

    if (!name) {
      alert('Please enter a character name.');
      return;
    }

    const character = { name, characterClass, level, species };
    characters.push(character);
    updatePartyTable();

    showToast(
      `<strong>${name}</strong> the <strong>Level ${level} ${characterClass}</strong> has joined the party of adventurers. Pity the foe that dares cross their path!`,
      'success',
      'Party Member Added',
      2500
    );
  }

  // Function to update the party table
  function updatePartyTable() {
    // ✅ Preserve existing members instead of clearing the table
    const existingRows = [...characterTableBody.querySelectorAll('tr')];
    const existingNames = existingRows.map((row) =>
      row.children[0].textContent.trim()
    );

    characters.forEach((character, index) => {
      if (!existingNames.includes(character.name)) {
        // ✅ Prevent duplicate overwriting
        const row = document.createElement('tr');
        row.innerHTML = `
                <td class="align-middle fw-bold">${character.name}</td>
                <td class="align-middle">${character.level}</td>
                <td class="align-middle">${capitalizeFirstLetter(
                  character.species
                )}</td>
                <td class="align-middle">${capitalizeFirstLetter(
                  character.characterClass
                )}</td>
                <td class="align-middle text-end"><button class="btn btn-danger btn-sm remove-character" data-index="${index}" data-tooltip="top" title="Remove from Encounter">
                    <i class="bi bi-dash"></i>
                </button></td>
            `;
        characterTableBody.appendChild(row);
        initializeTooltip();
      }
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-character').forEach((button) => {
      button.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        const name = row.children[0]?.textContent.trim();
        const level = row.children[1]?.textContent.trim();
        const characterClass = row.children[3]?.textContent.trim();

        // Check if the character is in the characters array
        const index = characters.findIndex((c) => c.name === name);
        if (index !== -1) {
          characters.splice(index, 1); // Remove from the array
        }

        row.remove(); // ✅ Remove row without resetting the table

        let removalMessage = `<strong>${name}</strong> the <strong>Level ${level} ${characterClass}</strong> has left the party of adventurers.`;
        if (characters.length === 0) {
          removalMessage += ` <strong>The party is now empty.</strong>`;
        }

        showToast(removalMessage, 'danger', 'Party Member Removed', 2500);
        if (typeof window.updatePartyCalculations === 'function') {
          window.updatePartyCalculations();
        } else {
          console.error('❌ updatePartyCalculations() is not available.');
        }
      });
    });
  }

  // Attach function globally so script.js can use addCharacter()
  window.addCharacter = addCharacter;
});
