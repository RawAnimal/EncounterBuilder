document.addEventListener('DOMContentLoaded', () => {
  const characterTableBody = document.getElementById('character-table-body');
  const avgLevelDisplay = document.getElementById('average-party-level');
  const xpBudgetDisplay = document.getElementById('xp-budget');
  const xpModeButtons = document.querySelectorAll('#xp-mode button');
  const difficultyButtons = document.querySelectorAll(
    '#encounter-difficulty button'
  );

  let xpMode = 'group'; // Default to group mode

  function calculateAveragePartyLevel() {
    const characterRows = characterTableBody.querySelectorAll('tr');
    let totalLevel = 0;
    let numCharacters = 0;

    characterRows.forEach((row) => {
      const levelCell = row.cells[1].textContent.match(/\d+/); // Extract level number
      if (levelCell) {
        totalLevel += parseInt(levelCell[0], 10);
        numCharacters++;
      }
    });

    const averageLevel =
      numCharacters > 0 ? Math.floor(totalLevel / numCharacters) : 0;
    avgLevelDisplay.textContent = averageLevel;
  }

  async function fetchXpBudget() {
    try {
      // Fetch master data first
      const masterResponse = await fetch('data/dnd_2024_master.json');
      if (!masterResponse.ok) throw new Error('Failed to load master data');

      const masterData = await masterResponse.json();
      const xpBudgetPath = masterData.data?.xp_budget;

      if (!xpBudgetPath) throw new Error('XP Budget dataset path not found');

      // Fetch XP budget from the correct path
      const xpResponse = await fetch(xpBudgetPath);
      if (!xpResponse.ok) throw new Error('Failed to load XP budget data');

      return await xpResponse.json();
    } catch (error) {
      console.error('Error loading XP budget data:', error);
      return null;
    }
  }

  function getActiveDifficulty() {
    return document
      .querySelector('#encounter-difficulty .active')
      .id.replace('difficulty-', '');
  }

  function calculateXpBudget(xpData) {
    if (!xpData) return;
    const characterRows = characterTableBody.querySelectorAll('tr');
    const numCharacters = characterRows.length;
    const difficulty = getActiveDifficulty();

    if (numCharacters === 0) {
      xpBudgetDisplay.textContent = 0;
      return; // Stop further calculation
    }

    let totalXp = 0;

    if (xpMode === 'group') {
      const avgLevel = parseInt(avgLevelDisplay.textContent, 10);
      if (avgLevel === 0) {
        xpBudgetDisplay.textContent = 0;
        return; // Stop further calculation
      }
      const levelData = xpData.xp_budget.find(
        (entry) => entry.level === avgLevel
      );
      if (!levelData)
        throw new Error('XP data not found for level: ' + avgLevel);
      totalXp = Math.floor(levelData[difficulty] * numCharacters);
    } else {
      characterRows.forEach((row) => {
        const level = parseInt(row.cells[1].textContent.match(/\d+/)[0], 10);
        const levelData = xpData.xp_budget.find(
          (entry) => entry.level === level
        );
        if (!levelData)
          throw new Error('XP data not found for level: ' + level);
        totalXp += levelData[difficulty];
      });
      totalXp = Math.floor(totalXp);
    }

    xpBudgetDisplay.textContent = totalXp;
  }

  xpModeButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      xpModeButtons.forEach((btn) =>
        btn.classList.remove('btn-primary', 'active')
      );
      button.classList.add('btn-primary', 'active');
      button.classList.remove('btn-secondary');

      xpMode = button.id === 'xp-individual' ? 'individual' : 'group';
      xpModeButtons.forEach((btn) => {
        if (!btn.classList.contains('active')) {
          btn.classList.add('btn-secondary');
        }
      });

      const xpData = await fetchXpBudget();
      calculateXpBudget(xpData);
    });
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      difficultyButtons.forEach((btn) =>
        btn.classList.remove('btn-primary', 'active')
      );
      button.classList.add('btn-primary', 'active');
      button.classList.remove('btn-secondary');

      difficultyButtons.forEach((btn) => {
        if (!btn.classList.contains('active')) {
          btn.classList.add('btn-secondary');
        }
      });

      const xpData = await fetchXpBudget();
      calculateXpBudget(xpData);
    });
  });

  const observer = new MutationObserver(async () => {
    calculateAveragePartyLevel();
    const xpData = await fetchXpBudget();
    calculateXpBudget(xpData);
  });

  observer.observe(characterTableBody, { childList: true, subtree: true });

  (async () => {
    calculateAveragePartyLevel();
    const xpData = await fetchXpBudget();
    calculateXpBudget(xpData);
  })();
});
