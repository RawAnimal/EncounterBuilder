// adversaryManager.js - Handles adding/removing adversaries to Bad Guys table
import { showToast } from './toastManager.js';
import { formatCR } from './adversaryData.js';

let addedAdversaries = {}; // Tracks added adversaries

// Function to add an adversary to the Bad Guys table
function addAdversary(adversary) {
  const tableBody = document.getElementById('adversary-table-body');
  if (!tableBody) return;

  if (!addedAdversaries) {
    addedAdversaries = {};
  }

  if (addedAdversaries[adversary.name]) {
    addedAdversaries[adversary.name].quantity += 1;
    document.getElementById(`qty-${adversary.name}`).innerText =
      addedAdversaries[adversary.name].quantity;

    showToast(
      `<strong>${formatText(
        adversary.name
      )}</strong> count on the Adversary List has increased to 
		      <strong>${addedAdversaries[adversary.name].quantity}</strong>, adding 
		      <strong>${adversary.xp.toLocaleString()} XP</strong> to the Encounter for a tougher challenge.`,
      'success',
      'Adversary Increase',
      2500
    );

    updateTotalAdversaryXP();
    return;
  }

  // Otherwise, create a new row for the adversary
  addedAdversaries[adversary.name] = { adversary, quantity: 1 };

  const row = document.createElement('tr');
  row.dataset.adversaryId = adversary.name;
  row.innerHTML = `
        <td id="qty-${
          adversary.name
        }" class="adversary-quantity align-middle fw-bold">1</td>
        <td class="align-middle fw-bold">${formatText(adversary.name)}</td>
        <td class="align-middle">${formatCR(adversary.cr)}</td>
        <td class="align-middle">${adversary.xp.toLocaleString()}</td>
        <td class="align-middle  text-end"><button class="btn btn-danger btn-sm remove-adversary" data-name="${
          adversary.name
        }"><i class="bi bi-dash"></i></button></td>
    `;

  tableBody.appendChild(row);

  // Add remove button event listener
  const removeButton = row.querySelector('.remove-adversary');
  removeButton.addEventListener('click', () =>
    removeAdversary(adversary.name)
  );

  showToast(
    `<strong>${formatText(
      adversary.name
    )}</strong> has been added to the Adversary List, 
    increasing the Encounter by <strong>${adversary.xp.toLocaleString()} XP</strong> for a greater challenge.`,
    'success',
    'Adversary Added',
    2500
  );

  updateTotalAdversaryXP();
}

function removeAdversary(name) {
  if (!addedAdversaries[name]) return;

  const adversaryData = addedAdversaries[name];
  if (adversaryData.quantity > 1) {
    adversaryData.quantity -= 1;
    document.getElementById(`qty-${name}`).innerText = adversaryData.quantity;

    showToast(
      `<strong>${formatText(
        name
      )}</strong> count on the Adversary List has decreased to 
		      <strong>${adversaryData.quantity}</strong>, removing 
		      <strong>${adversaryData.adversary.xp.toLocaleString()} XP</strong> from the Encounter for an easier challenge.`,
      'danger',
      'Adversary Decrease',
      2500
    );

    updateTotalAdversaryXP();
    return;
  }

  // If only one adversary left, remove from table
  delete addedAdversaries[name];

  const row = document.querySelector(`[data-adversary-id="${name}"]`);
  if (row) {
    row.remove();
  }

  showToast(
    `The last <strong>${formatText(
      name
    )}</strong> has been removed from the Encounter decreasing the challenge by ${adversaryData.adversary.xp.toLocaleString()} XP.`,
    'danger',
    'Adversary Removed',
    2500
  );

  updateTotalAdversaryXP();
}

function updateTotalAdversaryXP() {
  let totalXP = 0;

  for (const adversaryName in addedAdversaries) {
    const adversaryData = addedAdversaries[adversaryName]; // Get the stored adversary data
    totalXP += adversaryData.adversary.xp * adversaryData.quantity; // Access XP correctly
  }

  // Update the encounter summary panel
  const xpElement = document.getElementById('bad-guys-xp');
  if (xpElement) {
    xpElement.textContent = totalXP.toLocaleString();
  }

  // Ensure encounter balance updates properly
  updateEncounterBalance();
}

// Function to update encounter balance
function updateEncounterBalance() {
  const xpBudget =
    parseInt(
      document.getElementById('xp-budget').textContent.replace(/,/g, '')
    ) || 0;
  const totalXP =
    parseInt(
      document.getElementById('bad-guys-xp').textContent.replace(/,/g, '')
    ) || 0;

  const balance = xpBudget - totalXP;
  const balanceElement = document.getElementById('encounter-balance');
  const labelElement = balanceElement
    .closest('.stat-box')
    .querySelector('.stat-label');
  const valueContainer = balanceElement.closest('.stat-value');

  // Set color based on the balance
  let colorClass, borderClass, textColor;
  if (balance > 0) {
    colorClass = 'bg-success';
    borderClass = 'border-success';
    textColor = 'text-success';
  } else if (balance < 0) {
    colorClass = 'bg-danger';
    borderClass = 'border-danger';
    textColor = 'text-danger';
  } else {
    colorClass = 'bg-dark';
    borderClass = 'border-dark';
    textColor = 'text-dark';
  }

  // Apply classes to elements
  balanceElement.textContent = balance.toLocaleString();
  balanceElement.className = `mx-4 my-1 ${textColor}`;
  labelElement.className = `stat-label px-3 py-2 text-white ${colorClass}`;
  valueContainer.className = `stat-value border border-3 border-l-0 ${borderClass}`;
}

// Utility function to capitalize words and replace underscores
function formatText(str) {
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
}

// MutationObserver to watch for changes in XP Budget and Total Adversary XP
function setupEncounterBalanceObserver() {
  const targetNodes = [
    document.getElementById('xp-budget'),
    document.getElementById('bad-guys-xp'),
  ];

  const config = { childList: true, subtree: true, characterData: true };

  const observer = new MutationObserver(() => {
    updateEncounterBalance();
  });

  targetNodes.forEach((node) => {
    if (node) observer.observe(node, config);
  });
}

// Call observer setup on page load
document.addEventListener('DOMContentLoaded', setupEncounterBalanceObserver);

export { addAdversary };
