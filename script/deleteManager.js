// Function to open delete confirmation modal
import { deleteData } from './database.js';
import { showToast } from './toastManager.js';
import { setupGeneralModal, resetAdminPanel } from './script.js';

// Function to open delete confirmation modal
export async function confirmDelete(action, storeName, recordId, recordName) {
  console.log(`🗑️ Deleting ${recordName} from ${storeName} (ID: ${recordId})`);

  try {
    await deleteData(storeName, recordId);

    // ✅ Check if recordName is undefined and log it
    if (!recordName) {
      console.error(
        "⚠️ recordName is undefined. Check how it's being passed."
      );
    }

    // ✅ Ensure recordName is properly formatted before passing to toast
    const formattedName = recordName
      ? `<strong>${recordName}</strong>`
      : 'Unknown Record';

    showToast(`✅ ${formattedName} deleted successfully.`, 'success');

    // Dynamically select the correct delete panel based on action
    const deletePanel = document.getElementById(`${action}-details`);

    if (deletePanel) {
      console.log(`✅ Hiding delete panel for action: ${action}`);
      deletePanel.classList.add('d-none');
    } else {
      console.warn(`Delete panel not found for action: ${action}`);
    }

    // ✅ Remove 'active' and 'btn-primary' from the menu button
    const activeButton = document.querySelector(
      '#encounter-admin .btn-primary.active'
    );
    if (activeButton) {
      activeButton.classList.remove('btn-primary', 'active');
      activeButton.classList.add('btn-secondary');
    }

    // document
    //   .querySelectorAll('[id^="delete-"][id$="-details"]')
    //   .forEach((panel) => {
    //     panel.classList.add('d-none');
    //   });

    // Reset the admin panel after deletion
    resetAdminPanel();

    // ✅ Reset the admin menu completely
    resetAdminPanel();
  } catch (error) {
    console.error(`❌ Error deleting '${recordName}':`, error);
    showToast(`❌ Error deleting '${recordName}'.`, 'danger');
  }
}
