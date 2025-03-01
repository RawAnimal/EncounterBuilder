// toastManager.js - Centralized toast handling for the entire application
export function showToast(
  message,
  type = 'success',
  header = 'Notification',
  duration = 2500
) {
  const toastElement = document.getElementById('notification-toast');
  const toastBody = document.getElementById('toast-message');
  const toastHeader = document.getElementById('toast-header-text');

  if (!toastElement || !toastBody || !toastHeader) {
    console.error('ERROR: Toast elements not found!');
    return;
  }

  // Set toast body message
  toastBody.innerHTML = message;

  // Define Bootstrap icons for different types
  const icons = {
    success: '<i class="bi bi-check-circle"></i>',
    error: '<i class="bi bi-x-circle"></i>',
    warning: '<i class="bi bi-exclamation-diamond"></i>',
    info: '<i class="bi bi-info-circle"></i>',
  };

  // Set the toast header with an icon
  toastHeader.innerHTML = `${icons[type] || ''} ${header}`;

  // Apply Bootstrap toast styling
  const textColor = type === 'warning' ? 'text-black' : 'text-white';
  toastElement.className = `toast align-items-center ${textColor} bg-${type} border-0`;

  // Initialize and show the toast
  const toastInstance = new bootstrap.Toast(toastElement, { delay: duration });
  toastInstance.show();
}
