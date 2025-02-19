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
