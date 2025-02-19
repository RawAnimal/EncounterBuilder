// adversaryData.js - Handles adversary data loading

let adversaries = [];
let adversaryMetadata = {};

async function loadAdversaries() {
  try {
    const response = await fetch('data/adversaries.json');
    const data = await response.json();

    // Sort adversaries alphabetically by name
    adversaries = data.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Adversaries loaded successfully:', adversaries);

    populateCRFilter();
  } catch (error) {
    console.error('Error loading adversaries:', error);
  }
}

async function loadAdversaryMetadata() {
  try {
    const response = await fetch('data/adversary_metadata.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    adversaryMetadata = await response.json();

    console.log('Adversary metadata loaded successfully:', adversaryMetadata);

    populateHabitatFilter();
    populateTypeFilter();
    populateGroupFilter(); // ✅ Populate Group filter after loading metadata
  } catch (error) {
    console.error('Error loading adversary metadata:', error);
  }
}

function getAdversaries() {
  return adversaries;
}

function getAdversaryMetadata() {
  return adversaryMetadata;
}

// ✅ New Function: Get Unique, Sorted Group Values with Formatted Display
function getGroupList() {
  if (!adversaryMetadata.groups) return [];

  // Extract and format group names
  const groupValues = adversaryMetadata.groups.map((group) => ({
    value: group,
    display: formatText(group),
  }));

  // Sort alphabetically by display name
  return groupValues.sort((a, b) => a.display.localeCompare(b.display));
}

// ✅ Function: Get Unique, Sorted Type Values with Formatted Display
function getTypeList() {
  if (!adversaryMetadata.types) return [];

  const typeValues = adversaryMetadata.types.map((type) => ({
    value: type,
    display: formatText(type),
  }));

  return typeValues.sort((a, b) => a.display.localeCompare(b.display));
}

// ✅ Function: Get Unique, Sorted Habitat Values with Formatted Display
function getHabitatList() {
  if (!adversaryMetadata.habitats) return [];

  const habitatValues = adversaryMetadata.habitats.map((habitat) => ({
    value: habitat,
    display: formatText(habitat),
  }));

  return habitatValues.sort((a, b) => a.display.localeCompare(b.display));
}

// ✅ Helper Function: Convert Text (Capitalize & Remove Underscores)
function formatText(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

// ✅ Function: Get Unique, Sorted CR Values with Formatted Display
function getUniqueCRValues() {
  if (!adversaries.length) return [];

  let crValues = adversaries.map((adv) => adv.cr);

  crValues = [...new Set(crValues)].sort((a, b) => a - b);

  const formattedCRs = crValues.map((cr) => ({
    value: cr.toString(),
    display: formatCR(cr),
  }));

  return formattedCRs;
}

// ✅ Helper Function: Convert CR Decimal to Fraction Display
function formatCR(cr) {
  const fractionMap = {
    0.125: '1/8',
    0.25: '1/4',
    0.5: '1/2',
    0.75: '3/4',
  };
  return fractionMap[cr] || cr.toString();
}
