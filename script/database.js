function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 4); // Increment version to force upgrade

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('parties')) {
        const store = db.createObjectStore('parties', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: true });
      }

      if (!db.objectStoreNames.contains('adversaries')) {
        const store = db.createObjectStore('adversaries', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: true });
      }

      if (!db.objectStoreNames.contains('encounters')) {
        const store = db.createObjectStore('encounters', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: true });
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
    const request = indexedDB.open('EncounterArchitectDB', 4); // Incremented version to force upgrade

    request.onsuccess = function (event) {
      const db = event.target.result;

      // Log available object stores to debug missing store issues
      console.log(
        '✅ IndexedDB Opened. Available Object Stores:',
        db.objectStoreNames
      );

      if (!db.objectStoreNames.contains(storeName)) {
        console.error(`❌ Object store '${storeName}' not found!`);
        return reject(`Object store '${storeName}' does not exist.`);
      }

      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      if (!data.id) {
        data.id = crypto.randomUUID(); // Generate a unique ID if not provided
      }
      const addRequest = store.add(data);

      addRequest.onsuccess = () => resolve('✅ Data saved successfully.');
      addRequest.onerror = (event) =>
        reject('❌ Save failed: ' + event.target.error);
    };

    request.onerror = function (event) {
      reject('❌ Database open failed: ' + event.target.error);
    };
  });
}

function loadData(storeName, key = null) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 4);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      if (key) {
        // Load a specific entry
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () =>
          reject(`Error loading ${storeName}: ${getRequest.error}`);
      } else {
        // Load all entries (for dropdown population)
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () =>
          reject(`Error loading ${storeName}: ${getAllRequest.error}`);
      }
    };

    request.onerror = function (event) {
      reject(`Database open failed: ${event.target.error}`);
    };
  });
}

function deleteData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EncounterArchitectDB', 4);
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
    const request = indexedDB.open('EncounterArchitectDB', 4);
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
