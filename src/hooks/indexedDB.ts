import { Filter } from "@/types/api/FilterType";

let db: IDBDatabase;
let dbInitialized: Promise<IDBDatabase>;

if (typeof window !== 'undefined') {
  const request: IDBOpenDBRequest = indexedDB.open('steamNetwork', 1);

  request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
    db = (event.target as IDBOpenDBRequest).result;

    if (!db.objectStoreNames.contains('networkFilter')) {
      const networkFilterStore: IDBObjectStore = db.createObjectStore('networkFilter', { keyPath: 'id' });
      networkFilterStore.createIndex('Categories', 'Categories', { unique: false });
      networkFilterStore.createIndex('Price', 'Price', { unique: false });
      networkFilterStore.createIndex('Mode', 'Mode', { unique: false });
      networkFilterStore.createIndex('Device', 'Device', { unique: false });
      networkFilterStore.createIndex('Playtime', 'Playtime', { unique: false });
    }

    if (!db.objectStoreNames.contains('userAddedGames')) {
      const userAddedGamesStore: IDBObjectStore = db.createObjectStore('userAddedGames', {keyPath: 'id'});
      userAddedGamesStore.createIndex('steamGameId', 'steamGameId', { unique: false });
    }
  };

  request.onsuccess = function (event: Event) {
    db = (event.target as IDBOpenDBRequest).result;
    console.log('Database opened successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Database error:', (event.target as IDBOpenDBRequest).error);
  };

  dbInitialized = new Promise((resolve, reject) => {
    request.onsuccess = function (event: Event) {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');
      resolve(db);
    };

    request.onerror = function (event: Event) {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getFilterData(): Promise<Filter | null> {
  if (typeof window === 'undefined') return null;

  const db = await dbInitialized;
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['networkFilter']);
    const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
    const request: IDBRequest = objectStore.get('unique_id');

    request.onsuccess = function (event: Event) {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('Data retrieved successfully:', result);
        const filterResult: Filter = {
          Categories: result.Categories,
          Price: result.Price,
          Mode: result.Mode,
          Device: result.Device,
          Playtime: result.Playtime
        }
        resolve(filterResult);
      } else {
        console.log('No data found for key: unique_id');
        resolve(null);
      }
    };

    request.onerror = function (event: Event) {
      console.error('Error retrieving data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function changeFilterData(data: Filter) {
  if (typeof window === 'undefined') return;

  const db = await dbInitialized;
  const transaction: IDBTransaction = db.transaction(['networkFilter'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('networkFilter');
  const request: IDBRequest = objectStore.put({id: "unique_id", ...data});

  request.onsuccess = function (event: Event) {
    console.log('Data updated successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Error updating data:', (event.target as IDBRequest).error);
  };
}

export async function getGameIdData(): Promise<string[] | null> {
  if (typeof window === 'undefined') return null;
  const db = await dbInitialized;
  return new Promise((resolve, reject) => {
    const transaction: IDBTransaction = db.transaction(['userAddedGames']);
    const objectStore: IDBObjectStore = transaction.objectStore('userAddedGames');
    const request: IDBRequest = objectStore.get('unique_id');

    request.onsuccess = function (event: Event) {
      const result = (event.target as IDBRequest).result;
      if (result) {
        console.log('Data retrieved successfully:', result);
        resolve(result.steamGameId);
      } else {
        console.log('No data found for key: unique_id');
        resolve(null);
      }
    };

    request.onerror = function (event: Event) {
      console.error('Error retrieving data:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

export async function changeGameIdData(steamGameId: string[]) {
  if (typeof window === 'undefined') return;

  const db = await dbInitialized;
  const transaction: IDBTransaction = db.transaction(['userAddedGames'], 'readwrite');
  const objectStore: IDBObjectStore = transaction.objectStore('userAddedGames');
  const request: IDBRequest = objectStore.put({id: "unique_id", steamGameId});

  request.onsuccess = function (event: Event) {
    console.log('Data updated successfully');
  };

  request.onerror = function (event: Event) {
    console.error('Error updating data:', (event.target as IDBRequest).error);
  };
}