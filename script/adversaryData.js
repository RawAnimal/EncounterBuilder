// adversaryData.js - Handles adversary data loading

let adversaries = [];
let lookupCR = [];
let lookupHabitats = [];
let lookupTypes = [];
let lookupGroups = [];

async function loadAdversaries() {
  try {
    const masterResponse = await fetch('data/dnd_2024_master.json');
    const masterData = await masterResponse.json();

    const adversaryResponse = await fetch(masterData.data.adversaries);

    const data = await adversaryResponse.json();

    // Sort adversaries alphabetically by name
    if (data.adversaries) {
      adversaries = Object.values(data.adversaries)
        .filter((adv) => adv && adv.name) // Remove empty/undefined entries
        .map((adv) => ({
          name: adv.name || 'Unknown',
          cr: adv.cr || 0,
          type: adv.type || 'Unknown',
          habitat: adv.habitat || [],
          group: adv.group || [],
          xp: adv.xp || 0,
          associations: adv.associations || [],
          source: adv.source || [], // ✅ Keep the full source array intact
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      console.error(
        'Adversary data is missing or incorrectly formatted:',
        data
      );
    }

    // populateCRFilter();
    // populateXPFilter(); // Ensure XP filter loads after data
  } catch (error) {
    console.error('Error loading adversaries:', error);
  }
}

// ✅ New Function: Get XP Range (Min & Max)
function getXPRange() {
  if (!adversaries.length) return { min: 0, max: 0 };

  // Extract XP values
  const xpValues = adversaries.map((adv) => adv.xp);

  // Get min and max XP
  const minXP = Math.min(...xpValues);
  const maxXP = Math.max(...xpValues);

  return { min: minXP, max: maxXP };
}

function getGroupList() {
  return lookupGroups
    .filter((group) => typeof group === 'string' && group.trim().length > 0) // Ensure valid strings
    .map((group) => {
      const formattedText = formatText(group); // Ensure text is formatted properly
      return { value: group, display: formattedText };
    })
    .sort((a, b) => a.display.localeCompare(b.display));
}

function getTypeList() {
  return lookupTypes
    .map((type) => ({
      value: type,
      display: formatText(type),
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
}

function getHabitatList() {
  return lookupHabitats
    .map((habitat) => ({
      value: habitat,
      display: formatText(habitat),
    }))
    .sort((a, b) => a.display.localeCompare(b.display));
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

function getAdversaries() {
  return adversaries;
}

function getLookupCR() {
  return lookupCR;
}

function getLookupHabitats() {
  return lookupHabitats;
}

function getLookupTypes() {
  return lookupTypes;
}

function getLookupGroups() {
  return lookupGroups;
}

async function loadLookupData() {
  try {
    const masterResponse = await fetch('data/dnd_2024_master.json');
    const masterData = await masterResponse.json();

    const [crResponse, habitatResponse, typeResponse, groupResponse] =
      await Promise.all([
        fetch(masterData.data.crs),
        fetch(masterData.data.habitats),
        fetch(masterData.data.types),
        fetch(masterData.data.groups),
      ]);

    lookupCR = (await crResponse.json()).crs || [];
    lookupHabitats = (await habitatResponse.json()).habitats || [];
    lookupTypes = (await typeResponse.json()).types || [];
    lookupGroups = (await groupResponse.json()).groups || [];
  } catch (error) {
    console.error('Error loading lookup data:', error);
  }
}

export function extractWebSource(adversary) {
  if (adversary.source && Array.isArray(adversary.source)) {
    const webSource = adversary.source.find((src) => src.web && src.link);
    return webSource ? webSource.link : null;
  }
  return null;
}

export {
  loadAdversaries,
  loadLookupData,
  getAdversaries,
  getLookupCR,
  getLookupHabitats,
  getLookupTypes,
  getLookupGroups,
  getXPRange,
  getGroupList,
  getTypeList,
  getHabitatList,
  getUniqueCRValues,
};
