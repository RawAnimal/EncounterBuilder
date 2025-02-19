// adversaryUI.js - Handles UI rendering for adversaries

// Ensure addedAdversaries is defined
typeof addedAdversaries !== 'undefined' || (addedAdversaries = {});

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing Adversary UI...');
  renderAdversaryList();

  // Attach event listener for search bar
  const searchInput = document.getElementById('search-adversary');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAdversaryList(searchInput.value);
    });
  }
});

// Function to render the adversary list with optional filtering
function renderAdversaryList(searchQuery = '') {
  console.log('Rendering adversary list...');

  const adversaryList = document.getElementById('adversary-list');
  adversaryList.innerHTML = ''; // Clear existing content

  // Filter adversaries based on search query
  const filteredAdversaries = adversaries.filter((adv) =>
    adv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredAdversaries.length === 0) {
    adversaryList.innerHTML = '<p>No adversaries found.</p>';
    return;
  }

  // Create Bootstrap table
  const table = document.createElement('table');
  table.className = 'table table-striped'; // Bootstrap table with alternating row colors

  // Create table body
  const tbody = document.createElement('tbody');

  filteredAdversaries.forEach((adversary) => {
    const row = document.createElement('tr');

    // First column: Name, CR, XP
    const nameCell = document.createElement('td');
    nameCell.className = 'align-middle'; // Vertically align content
    nameCell.innerHTML = `<strong>${formatText(
      adversary.name
    )}</strong> (CR: ${adversary.cr}, XP: ${adversary.xp})`;
    row.appendChild(nameCell);

    // Second column: Add button
    const buttonCell = document.createElement('td');
    buttonCell.className = 'text-end align-middle'; // Right-align and vertically align content

    const addButton = document.createElement('button');
    addButton.className = 'btn btn-primary btn-sm'; // Solid primary Bootstrap button
    addButton.innerHTML = '+';
    addButton.onclick = () => addAdversary(adversary);

    buttonCell.appendChild(addButton);
    row.appendChild(buttonCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  adversaryList.appendChild(table);

  console.log('Adversary list rendered.');
}

// Function to format text (capitalize & remove underscores)
function formatText(str) {
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize words
}

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
}

// Function to remove an adversary from the Bad Guys table
function removeAdversary(name) {
  if (addedAdversaries[name]) {
    const qtyElement = document.getElementById(`qty-${name}`);

    // Reduce quantity if more than 1
    if (addedAdversaries[name].quantity > 1) {
      addedAdversaries[name].quantity -= 1;
      qtyElement.innerText = addedAdversaries[name].quantity;
    } else {
      // Remove row entirely if quantity reaches 0
      delete addedAdversaries[name];
      qtyElement.closest('tr').remove();
    }
  }
}
