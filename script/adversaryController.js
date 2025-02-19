// adversaryController.js - Handles control logic for adversary interactions

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary System...');

  // Load adversary data
  await loadAdversaries();
  await loadAdversaryMetadata();

  // Render the adversary list
  renderAdversaryList();
});
