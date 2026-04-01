/*eslint-disable*/
import { openDB } from "idb";
export const initiateLocalCacheDB = {
  data: () => ({}),
  methods: {
    // Initialize the database or check and create a store
    async checkAndCreateAllStores() {
      try {
        const storeConfigs = {
          STORE_CHAT_LIST: { keyPath: 'team_id' },
          STORE_CHAT_MESSAGE: { keyPath: 'topic' },
          STORE_NOTIFICATIONS_LIST: { keyPath: 'msg_id' }
        };

        // Increment database version to trigger upgrade
        const db = await openDB("STICHH_LOCALDATABASE", 7, {
          upgrade(db, oldVersion, newVersion) {
            // console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

            // Create all required stores if they don't exist
            for (const [storeName, config] of Object.entries(storeConfigs)) {
              if (!db.objectStoreNames.contains(storeName)) {
                // console.log(`Creating store: ${storeName}`);
                db.createObjectStore(storeName, config);
              } else {
                // console.log(`Store already exists: ${storeName}`);
              }
            }
          },
          blocked() {
            console.warn('Database upgrade blocked. Please close other tabs.');
          },
          blocking() {
            console.warn('This database is blocking another tab from upgrading.');
          }
        });

        // console.log("Database setup complete. Available stores:", Array.from(db.objectStoreNames));
        return db;
      } catch (error) {
        console.error("Error initializing DB:", error);
        throw error;
      }
    },
    async getAllItems(storeName) {
      try {
        const db = await openDB("STICHH_LOCALDATABASE", 7);
        const store = db.transaction(storeName, "readonly").objectStore(storeName);
        const items = await store.getAll();
        return items;
      } catch (error) {
        console.error("Error getting all items:", error);
        throw error;
      }
    },

    async listStore(storeName) {
      try {
        const db = await openDB("STICHH_LOCALDATABASE", 7);
        if (db.objectStoreNames.contains(storeName)) {

          return storeName;
        } else {

          return null;
        }
      } catch (error) {
        console.error("Error checking store:", error);
        throw error;
      }
    },
    async resetDatabase(StoreName) {
      try {
        await this.clearAllStores();

        // Force database recreation by deleting and recreating
        await this.deleteDatabase();
        await this.checkAndCreateAllStores();

        // const db = await this.checkAndCreateStore(StoreName);
        // console.log("New database created with stores.");

        // return db;
      } catch (error) {
        console.error("Error resetting the database:", error);
        throw error;
      }
    },

    async deleteDatabase() {
      try {
        const deleteRequest = indexedDB.deleteDatabase("STICHH_LOCALDATABASE");

        return new Promise((resolve, reject) => {
          deleteRequest.onsuccess = () => {

            resolve(); // Resolve the promise
          };

          deleteRequest.onerror = (event) => {
            console.error("Error deleting the database:", event.target.error);
            reject(new Error("Failed to delete database")); // Reject the promise
          };

          deleteRequest.onblocked = () => {
            console.warn("The deletion of the database is blocked. Please close other tabs or instances using the database.");
            reject(new Error("Database deletion blocked"));
          };
        });
      } catch (error) {
        console.error("Unexpected error deleting the database:", error);
        throw error; // Rethrow the error for higher-level handling
      }
    },
    async clearAllStores() {
      try {
        const db = await openDB("STICHH_LOCALDATABASE", 7);
        const transaction = db.transaction(db.objectStoreNames, "readwrite");

        for (const storeName of db.objectStoreNames) {
          const store = transaction.objectStore(storeName);
          await store.clear();

        }

        await transaction.done;

      } catch (error) {
        console.error("Error clearing stores:", error);
      }
    },
    async listAllStoresInDatabase() {
      try {
        const db = await openDB("STICHH_LOCALDATABASE", 7);

        const allStores = Array.from(db.objectStoreNames);

        return allStores;
      } catch (error) {
        console.error("Error listing all stores in the database:", error);
        throw error;
      }
    },

    async ensureDatabaseInitialized() {
      try {
        // console.log('Ensuring database is properly initialized...');

        // First, try to open the database to see what stores exist
        const db = await openDB("STICHH_LOCALDATABASE", 7);
        const existingStores = Array.from(db.objectStoreNames);
        // console.log('Existing stores:', existingStores);

        // Check if all required stores exist
        const requiredStores = ['STORE_CHAT_LIST', 'STORE_CHAT_MESSAGE', 'STORE_NOTIFICATIONS_LIST'];
        const missingStores = requiredStores.filter(store => !existingStores.includes(store));

        if (missingStores.length > 0) {
          // console.log('Missing stores detected:', missingStores);
          // console.log('Recreating database to ensure all stores exist...');

          // Close the database connection
          db.close();

          // Delete and recreate the database
          await this.deleteDatabase();
          await this.checkAndCreateAllStores();

          // console.log('Database recreated successfully with all required stores.');
        } else {
          // console.log('All required stores exist. Database is properly initialized.');
        }
      } catch (error) {
        console.error("Error ensuring database initialization:", error);

        // If there's an error, try to recreate the database
        try {
          // console.log('Attempting to recreate database due to error...');
          await this.deleteDatabase();
          await this.checkAndCreateAllStores();
          // console.log('Database recreated successfully after error.');
        } catch (recreateError) {
          console.error("Failed to recreate database:", recreateError);
          // Don't throw the error, just log it to prevent app crashes
          console.warn("Database initialization failed, but continuing...");
        }
      }
    },

    async getAllItems(storeName) {
      try {
        // Ensure database is initialized before accessing stores
        await this.ensureDatabaseInitialized();

        const db = await openDB("STICHH_LOCALDATABASE", 7);

        // Check if the store exists before trying to access it
        if (!db.objectStoreNames.contains(storeName)) {
          console.warn(`Store ${storeName} does not exist, returning empty array`);
          return [];
        }

        const store = db.transaction(storeName).objectStore(storeName);
        const allItems = await store.getAll();
        return allItems || [];
      } catch (error) {
        console.error(`Error getting all items from ${storeName}:`, error);
        // Return empty array instead of throwing error to prevent app crashes
        return [];
      }
    },
  },
};