// Version: 1.0 | JSON Validation Tool
// This script checks JSON formatting for adversaries.json, classes.json, and random_names.json

async function validateJSON() {
  const output = document.getElementById('output');
  output.innerHTML = '🔍 Validating JSON files...\n\n';

  const files = [
    '../data/adversaries.json',
    '../data/classes.json',
    '../data/random_names.json',
  ];

  for (const file of files) {
    try {
      const response = await fetch(file);
      const data = await response.json();
      output.innerHTML += `✅ Validating ${file}...\n`;

      if (file.includes('adversaries')) validateAdversaries(data, output);
      if (file.includes('classes')) validateClasses(data, output);
      if (file.includes('random_names')) validateNames(data, output);

      output.innerHTML += `✅ ${file} validation completed.\n\n`;
    } catch (error) {
      output.innerHTML += `❌ Error loading ${file}: ${error}\n`;
    }
  }
}

// 🔹 Validation Functions
function validateAdversaries(data, output) {
  const crPattern = /^[0-9]+(\.[0-9]+)?$/;
  const validKeys = [
    'name',
    'type',
    'habitat',
    'group',
    'cr',
    'xp',
    'associations',
    'source',
  ];

  data.creatures.forEach((creature, index) => {
    Object.keys(creature).forEach((key) => {
      if (!validKeys.includes(key)) {
        output.innerHTML += `❌ [adversaries.json] Invalid key "${key}" at index ${index}\n`;
      }
    });

    if (!isTitleCase(creature.name))
      output.innerHTML += `❌ [adversaries.json] Name not capitalized: "${creature.name}" at index ${index}\n`;
    ['type', 'group'].forEach((field) => {
      if (!isLowerUnderscore(creature[field]))
        output.innerHTML += `❌ [adversaries.json] ${field} should be lowercase_with_underscores: "${creature[field]}" at index ${index}\n`;
    });
    if (
      !Array.isArray(creature.habitat) ||
      !creature.habitat.every(isLowerUnderscore)
    ) {
      output.innerHTML += `❌ [adversaries.json] Habitat should be an array of lowercase_with_underscores values at index ${index}\n`;
    }
    if (!crPattern.test(creature.cr.toString()))
      output.innerHTML += `❌ [adversaries.json] CR should be a valid decimal number at index ${index}\n`;
    if (isNaN(creature.xp))
      output.innerHTML += `❌ [adversaries.json] XP should be a number at index ${index}\n`;
    if (
      !Array.isArray(creature.associations) ||
      !creature.associations.every(isLowerUnderscore)
    ) {
      output.innerHTML += `❌ [adversaries.json] Associations should be an array of lowercase_with_underscores at index ${index}\n`;
    }
  });
}

function validateClasses(data, output) {
  if (!Array.isArray(data.classes)) {
    output.innerHTML += `❌ [classes.json] "classes" should be an array\n`;
    return;
  }

  data.classes.forEach((className, index) => {
    if (!isTitleCase(className))
      output.innerHTML += `❌ [classes.json] Class name not capitalized: "${className}" at index ${index}\n`;
  });
}

function validateNames(data, output) {
  if (!Array.isArray(data.firstNames) || !Array.isArray(data.lastNames)) {
    output.innerHTML += `❌ [random_names.json] "firstNames" and "lastNames" should be arrays\n`;
    return;
  }

  data.firstNames.forEach((entry, index) => {
    if (!entry.name || !entry.category)
      output.innerHTML += `❌ [random_names.json] Missing name or category in firstNames at index ${index}\n`;
    if (!isTitleCase(entry.name))
      output.innerHTML += `❌ [random_names.json] First name not capitalized: "${entry.name}" at index ${index}\n`;
    if (!['male', 'female', 'both'].includes(entry.category)) {
      output.innerHTML += `❌ [random_names.json] Invalid category "${entry.category}" at index ${index}\n`;
    }
  });

  data.lastNames.forEach((name, index) => {
    if (!isTitleCase(name))
      output.innerHTML += `❌ [random_names.json] Last name not capitalized: "${name}" at index ${index}\n`;
  });
}

// 🔹 Utility functions
function isTitleCase(value) {
  return /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(value);
}

function isLowerUnderscore(value) {
  return /^[a-z]+(_[a-z]+)*$/.test(value);
}

// ✅ Ready to validate!
