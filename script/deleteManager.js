// Function to open delete confirmation modal
import { deleteData } from './database.js';
import { showToast } from './toastManager.js';
import { setupGeneralModal, resetAdminPanel } from './script.js';

// Function to open delete confirmation modal
export async function confirmDelete(action, storeName, recordId, recordName) {
  console.log(`🗑️ Deleting ${recordName} from ${storeName} (ID: ${recordId})`);

  try {
    await deleteData(storeName, recordId);

    // ✅ Ensure recordName is properly formatted before passing to toast
    const formattedName = recordName
      ? `<strong>${recordName}</strong>`
      : 'Unknown Record';

    showToast(`✅ ${formattedName} deleted successfully.`, 'success');

    // ✅ Map action names to correct delete panel IDs
    const panelMap = {
      'delete-encounter': 'delete-encounter-details',
      'delete-adversary': 'delete-adversary-details',
      'delete-party': 'delete-party-details',
    };

    const deletePanelId = panelMap[action];
    if (deletePanelId) {
      const deletePanel = document.getElementById(deletePanelId);
      if (deletePanel) {
        console.log(`✅ Hiding delete panel: ${deletePanelId}`);
        deletePanel.classList.add('d-none');
      }
    } else {
      console.warn(`⚠️ No matching panel found for action: ${action}`);
    }

    // ✅ Reset ONLY active buttons in the admin menu
    document
      .querySelectorAll('#admin-btn-group .dropdown-toggle.btn-primary.active')
      .forEach((btn) => {
        btn.classList.remove('btn-primary', 'active');
        btn.classList.add('btn-secondary');
      });

    console.log('✅ Admin buttons reset successfully.');

    // ✅ Reset the admin panel after deletion
    resetAdminPanel();
  } catch (error) {
    console.error(`❌ Error deleting '${recordName}':`, error);
    showToast(`❌ Error deleting '${recordName}'.`, 'danger');
  }
}
