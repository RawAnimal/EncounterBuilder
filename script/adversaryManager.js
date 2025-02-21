// adversaryManager.js - Handles adding/removing adversaries to Bad Guys table

let addedAdversaries = {}; // Tracks added adversaries

// Function to add an adversary to the Bad Guys table
function addAdversary(adversary) {
  const tableBody = document.getElementById('adversary-table-body');

  if (!addedAdversaries) {
    addedAdversaries = {};
  }

  // Check if adversary already exists
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
      'Adversary Increased',
      2500
    );

    updateTotalAdversaryXP();
    return;
  }

  // Add new adversary entry
  addedAdversaries[adversary.name] = { ...adversary, quantity: 1 };

  const row = document.createElement('tr');

  const qtyCell = document.createElement('td');
  qtyCell.id = `qty-${adversary.name}`;
  qtyCell.className = 'align-middle fw-bold';
  qtyCell.innerText = '1';
  row.appendChild(qtyCell);

  const nameCell = document.createElement('td');
  nameCell.className = 'align-middle fw-bold';
  nameCell.innerText = formatText(adversary.name);
  row.appendChild(nameCell);

  const crCell = document.createElement('td');
  crCell.className = 'align-middle';
  crCell.innerText = adversary.cr;
  row.appendChild(crCell);

  const xpCell = document.createElement('td');
  xpCell.className = 'align-middle';
  xpCell.innerText = adversary.xp;
  row.appendChild(xpCell);

  const removeCell = document.createElement('td');
  removeCell.className = 'text-end align-middle';

  const removeButton = document.createElement('button');
  removeButton.className = 'btn btn-danger btn-sm';
  removeButton.innerHTML = '<i class="bi bi-dash"></i>';
  removeButton.onclick = () => removeAdversary(adversary.name);

  removeCell.appendChild(removeButton);
  row.appendChild(removeCell);

  tableBody.appendChild(row);
  updateTotalAdversaryXP();

  showToast(
    `<strong>${formatText(
      adversary.name
    )}</strong> has been added to the Adversary List, 
    increasing the Encounter by <strong>${adversary.xp.toLocaleString()} XP</strong> for a greater challenge.`,
    'success',
    'Adversary Added',
    2500
  );
}

// Function to remove an adversary from the Bad Guys table
function removeAdversary(name) {
  if (addedAdversaries[name]) {
    const qtyElement = document.getElementById(`qty-${name}`);
    const adversaryXP = addedAdversaries[name].xp; // 🔥 Store XP before deleting

    let finalMessage = ''; // 🔥 Will store the toast message

    // Reduce quantity if more than 1
    if (addedAdversaries[name].quantity > 1) {
      addedAdversaries[name].quantity -= 1;
      qtyElement.innerText = addedAdversaries[name].quantity;

      finalMessage = `<strong>${formatText(
        name
      )}</strong> has been removed from the Adversary List, 
        lowering its quantity to <strong>${
          addedAdversaries[name].quantity
        }</strong> and 
        decreasing the Encounter by <strong>${adversaryXP.toLocaleString()} XP</strong>, easing the difficulty.`;
    } else {
      // 🔥 Store name before deletion for the toast message
      delete addedAdversaries[name]; // ✅ Delete after storing needed values
      qtyElement.closest('tr').remove();

      finalMessage = `<strong>${formatText(
        name
      )}</strong> (last) has been removed from the Adversary List, 
        reducing the Encounter by <strong>${adversaryXP.toLocaleString()} XP</strong>, making it less challenging.`;

      // ✅ If all adversaries are removed, append additional text
      if (Object.keys(addedAdversaries).length === 0) {
        finalMessage += ` <strong>The Encounter is now empty.</strong>`;
      }
    }

    // Show the toast with the final message
    showToast(finalMessage, 'danger', 'Adversary Removed', 2500);
  }
  updateTotalAdversaryXP();
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
}

// Call observer setup on page load
document.addEventListener('DOMContentLoaded', setupEncounterBalanceObserver);
