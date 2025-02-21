// toastManager.js - Centralized toast handling for the entire application
function showToast(
  message,
  type = 'success',
  header = 'Notification',
  duration = 3000
) {
  const toastElement = document.getElementById('notification-toast');
  const toastBody = document.getElementById('toast-message');
  const toastHeader = document.getElementById('toast-header-text');

  if (!toastElement || !toastBody || !toastHeader) {
    console.error('❌ ERROR: Toast elements not found!');
    return;
  }

  // Update toast content
  toastBody.innerHTML = message;
  toastHeader.innerText = header; // Set custom header

  // Set toast class based on type
  toastElement.className = `toast align-items-center text-white bg-${type} border-0`;

  // Bootstrap toast setup with custom duration
  const toast = new bootstrap.Toast(toastElement, { delay: duration });
  toast.show();
}
