// adversaryManager.js - Handles adding/removing adversaries to Bad Guys table

let addedAdversaries = {}; // Tracks added adversaries

// Function to add an adversary to the Bad Guys table
function addAdversary(adversary) {
  const tableBody = document.getElementById('adversary-table-body');

  // Ensure addedAdversaries object exists
  if (!addedAdversaries) {
    addedAdversaries = {};
  }

  // Check if adversary already exists
  if (addedAdversaries[adversary.name]) {
    addedAdversaries[adversary.name].quantity += 1;
    document.getElementById(`qty-${adversary.name}`).innerText =
      addedAdversaries[adversary.name].quantity;

    showToast(
      `Increased ${formatText(adversary.name)} count to ${
        addedAdversaries[adversary.name].quantity
      }.`
    );
    return;
  }

  // Add new adversary entry
  addedAdversaries[adversary.name] = {
    ...adversary,
    quantity: 1,
  };

  const row = document.createElement('tr');

  // Column 1: Quantity
  const qtyCell = document.createElement('td');
  qtyCell.id = `qty-${adversary.name}`;
  qtyCell.innerText = '1';
  row.appendChild(qtyCell);

  // Column 2: Name
  const nameCell = document.createElement('td');
  nameCell.innerText = formatText(adversary.name);
  row.appendChild(nameCell);

  // Column 3: CR
  const crCell = document.createElement('td');
  crCell.innerText = adversary.cr;
  row.appendChild(crCell);

  // Column 4: XP
  const xpCell = document.createElement('td');
  xpCell.innerText = adversary.xp;
  row.appendChild(xpCell);

  // Column 5: Remove Button
  const removeCell = document.createElement('td');
  removeCell.className = 'text-end';

  const removeButton = document.createElement('button');
  removeButton.className = 'btn btn-danger btn-sm';
  removeButton.innerHTML = '−';
  removeButton.onclick = () => removeAdversary(adversary.name);

  removeCell.appendChild(removeButton);
  row.appendChild(removeCell);

  tableBody.appendChild(row);

  updateTotalAdversaryXP();

  showToast(`${formatText(adversary.name)} added to Bad Guys.`);
}

// Function to remove an adversary from the Bad Guys table
function removeAdversary(name) {
  if (addedAdversaries[name]) {
    const qtyElement = document.getElementById(`qty-${name}`);

    // Reduce quantity if more than 1
    if (addedAdversaries[name].quantity > 1) {
      addedAdversaries[name].quantity -= 1;
      qtyElement.innerText = addedAdversaries[name].quantity;

      showToast(
        `Decreased ${formatText(name)} count to ${
          addedAdversaries[name].quantity
        }.`,
        'danger'
      );
    } else {
      // Remove row entirely if quantity reaches 0
      delete addedAdversaries[name];
      qtyElement.closest('tr').remove();

      showToast(`${formatText(name)} removed from Bad Guys.`, 'danger');
    }
  }
  updateTotalAdversaryXP();
}

// Function to show toast notification
function showToast(message, type = 'success') {
  const toastElement = document.getElementById('notification-toast');
  const toastBody = document.getElementById('toast-message');

  toastBody.textContent = message;
  toastElement.className = `toast align-items-center text-white bg-${type} border-0`;

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function updateTotalAdversaryXP() {
  let totalXP = 0;

  for (const adversaryName in addedAdversaries) {
    const adversary = addedAdversaries[adversaryName];
    totalXP += adversary.xp * adversary.quantity;
  }

  // Update the encounter summary panel
  document.getElementById('bad-guys-xp').textContent =
    totalXP.toLocaleString();
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

// Utility function to format text (capitalization & remove underscores)
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

  console.log('Encounter Balance Observer Initialized');
}

// Call observer setup on page load
document.addEventListener('DOMContentLoaded', setupEncounterBalanceObserver);
