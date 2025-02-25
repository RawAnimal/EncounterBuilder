// tooltipManager.js - Centralized Bootstrap Tooltip Handling

export function initializeTooltip() {
  document.querySelectorAll('[data-tooltip]').forEach((tooltipTriggerEl) => {
    let tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'hover',
      html: true,
      placement: tooltipTriggerEl.getAttribute('data-tooltip') || 'top',
    });

    tooltipTriggerEl.addEventListener('click', function () {
      tooltip.hide();
    });
  });
}

// Function to manually add tooltips to dynamically inserted elements
export function addTooltip(element, title) {
  if (!element) return;
  element.setAttribute('data-bs-toggle', 'tooltip');
  element.setAttribute('title', title);
  new bootstrap.Tooltip(element);
}

// Ensure tooltips are initialized on page load
document.addEventListener('DOMContentLoaded', initializeTooltip);
