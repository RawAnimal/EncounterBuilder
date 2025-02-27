function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 2); // Increment version to force upgrade

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      console.log('🔄 Database upgrade triggered...');

      if (!db.objectStoreNames.contains('parties')) {
        db.createObjectStore('parties', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains('adversaries')) {
        db.createObjectStore('adversaries', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains('encounters')) {
        db.createObjectStore('encounters', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = function (event) {
      console.log('✅ IndexedDB initialized successfully.');
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      console.error('❌ IndexedDB error:', event.target.errorCode);
      reject('IndexedDB failed to initialize.');
    };
  });
}

function saveData(storeName, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 2);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const addRequest = store.add(data);
      addRequest.onsuccess = () => resolve('Data saved successfully.');
      addRequest.onerror = (event) =>
        reject('Save failed: ' + event.target.error);
    };
    request.onerror = function (event) {
      reject('Database open failed: ' + event.target.error);
    };
  });
}

function loadData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 2);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = (event) =>
        reject('Load failed: ' + event.target.error);
    };
    request.onerror = function (event) {
      reject('Database open failed: ' + event.target.error);
    };
  });
}

function deleteData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 2);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => resolve('Data deleted successfully.');
      deleteRequest.onerror = (event) =>
        reject('Delete failed: ' + event.target.error);
    };
    request.onerror = function (event) {
      reject('Database open failed: ' + event.target.error);
    };
  });
}

async function loadAllData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 2);
    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(
        ['parties', 'adversaries', 'encounters'],
        'readonly'
      );

      const partiesStore = transaction.objectStore('parties').getAll();
      const adversariesStore = transaction.objectStore('adversaries').getAll();
      const encountersStore = transaction.objectStore('encounters').getAll();

      partiesStore.onsuccess = () => {
        adversariesStore.onsuccess = () => {
          encountersStore.onsuccess = () => {
            resolve({
              parties: partiesStore.result || [],
              adversaries: adversariesStore.result || [],
              encounters: encountersStore.result || [],
            });
          };
        };
      };

      transaction.onerror = function (event) {
        reject('Transaction failed: ' + event.target.error);
      };
    };
    request.onerror = function (event) {
      reject('Database open failed: ' + event.target.error);
    };
  });
}

// ✅ Ensuring functions are globally available for debugging
window.saveData = saveData;
window.loadData = loadData;
window.loadAllData = loadAllData;
window.deleteData = deleteData;

// ✅ Correctly exporting all required functions in a **single** export statement
export { initializeDatabase, saveData, loadData, deleteData, loadAllData };
