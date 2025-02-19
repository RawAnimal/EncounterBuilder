// adversaryManager.js - Handles adding/removing adversaries to Bad Guys table

let addedAdversaries = {}; // Tracks added adversaries

// ✅ Function to add an adversary to the Bad Guys table
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

  showToast(`${formatText(adversary.name)} added to Bad Guys.`);
}

// ✅ Function to remove an adversary from the Bad Guys table
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
        }.`
      );
    } else {
      // Remove row entirely if quantity reaches 0
      delete addedAdversaries[name];
      qtyElement.closest('tr').remove();

      showToast(`${formatText(name)} removed from Bad Guys.`);
    }
  }
}

// ✅ Function to show toast notifications
function showToast(message) {
  const toastElement = document.getElementById('notification-toast');
  const toastMessage = document.getElementById('toast-message');

  if (toastElement && toastMessage) {
    toastMessage.innerText = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
}

// ✅ Utility function to format text (capitalization & remove underscores)
function formatText(str) {
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
}
