// build_lookups.js - Generates lookup JSON files from adversaries_2024.json
//
// How to run this script:
// 1. Open a terminal or command prompt
// 2. Navigate to the script directory:
//    cd /path/to/your/directory
// 3. Run the script using Node.js:
//    node build_lookups.js
//
// Ensure Node.js is installed: https://nodejs.org/

const fs = require('fs');
const path = require('path');

function buildLookupFiles() {
  const baseDir = __dirname;
  const adversariesFile = path.join(baseDir, 'adversaries_2024.json');

  // Load adversaries_2024.json
  const rawData = fs.readFileSync(adversariesFile, 'utf-8');
  const data = JSON.parse(rawData);

  const adversaries = data.adversaries || {};
  const version = data.meta?.version || 'unknown';
  const timestamp = new Date().toISOString();

  // Collect unique values
  const crs = new Set();
  const habitats = new Set();
  const types = new Set();
  const groups = new Set();

  Object.values(adversaries).forEach((adversary) => {
    crs.add(adversary.cr);
    adversary.habitat.forEach((h) => habitats.add(h));
    types.add(adversary.type);
    adversary.group.forEach((g) => groups.add(g));
  });

  // Sort values (numerically for CRs, alphabetically for others)
  const lookupData = {
    'lookup_cr_2024.json': {
      version,
      generated: timestamp,
      crs: Array.from(crs).sort((a, b) => a - b),
    },
    'lookup_habitat_2024.json': {
      version,
      generated: timestamp,
      habitats: Array.from(habitats).sort(),
    },
    'lookup_type_2024.json': {
      version,
      generated: timestamp,
      types: Array.from(types).sort(),
    },
    'lookup_group_2024.json': {
      version,
      generated: timestamp,
      groups: Array.from(groups).sort(),
    },
  };

  // Write lookup files
  Object.entries(lookupData).forEach(([filename, content]) => {
    fs.writeFileSync(
      path.join(baseDir, filename),
      JSON.stringify(content, null, 2),
      'utf-8'
    );
  });

  console.log('Lookup files built successfully.');
}

buildLookupFiles();
PeriodicWave;
