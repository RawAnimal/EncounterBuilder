import { deleteData } from './database.js';
import { showToast } from './toastManager.js';

// Function to open delete confirmation modal
window.confirmDelete = function (storeName, recordId, recordName) {
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  document.getElementById('delete-modal-body').innerHTML = `
    <p>Are you sure you want to delete <strong>${recordName}</strong>?</p>
  `;
  document.getElementById('confirm-delete-btn').onclick = async () => {
    try {
      console.log(`Deleting ${recordId} from ${storeName}...`);
      await deleteData(storeName, recordId);
      showToast(`✅ '${recordName}' deleted successfully.`, 'success');
    } catch (error) {
      showToast(`❌ Error deleting '${recordName}'.`, 'danger');
    }
    modal.hide();
  };
  modal.show();
};
