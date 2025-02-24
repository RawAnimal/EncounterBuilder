import { showToast } from './toastManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const characterClassInput = document.getElementById('character-class');
  const characterLevelInput = document.getElementById('character-level');
  const characterTableBody = document.getElementById('character-table-body');

  let characters = [];

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

    showToast(
      `<strong>${name}</strong> the <strong>Level ${level} ${characterClass}</strong> has joined the party of adventurers. Pity the foe that dares cross their path!`,
      'success',
      'Party Member Added',
      2500
    );
  }

  // Function to update the party table
  function updatePartyTable() {
    characterTableBody.innerHTML = '';

    characters.forEach((character, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td class="align-middle fw-bold">${character.name}</td>
                <td class="align-middle">${character.level}</td>
                <td class="align-middle">${character.characterClass}</td>
                <td class="align-middle text-end"><button class="btn btn-danger btn-sm remove-character" data-index="${index}">
                    <i class="bi bi-dash"></i>
                </button></td>
            `;
      characterTableBody.appendChild(row);
    });

    // Add event listeners to remove buttons
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-character').forEach((button) => {
      button.addEventListener('click', (event) => {
        const index = event.target.closest('button').dataset.index;
        const removedCharacter = characters[index];

        characters.splice(index, 1);
        updatePartyTable();

        let removalMessage = `<strong>${removedCharacter.name}</strong> the <strong>Level ${removedCharacter.level} ${removedCharacter.characterClass}</strong> has left the party of adventurers.`;

        // Append extra message if the party is now empty
        if (characters.length === 0) {
          removalMessage += ` <strong>The party is now empty.</strong>`;
        }

        // Show toast notification
        showToast(removalMessage, 'danger', 'Party Member Removed', 2500);
      });
    });
  }

  // Attach function globally so script.js can use addCharacter()
  window.addCharacter = addCharacter;
});
