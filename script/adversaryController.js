import { loadAdversaries, loadLookupData } from './adversaryData.js';
import {
  applyFilters,
  renderAdversaryList,
  populateCRFilter,
  populateXPFilter,
  populateHabitatFilter,
  populateTypeFilter,
  populateGroupFilter,
} from './adversaryUI.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdversaries();
  await loadLookupData();

  // Ensure filters populate only AFTER lookup data is loaded
  populateCRFilter();
  populateXPFilter();
  populateHabitatFilter();
  populateTypeFilter();
  populateGroupFilter();

  document.getElementById('filter-group').addEventListener('change', () => {
    applyFilters();
  });

  renderAdversaryList();
});
