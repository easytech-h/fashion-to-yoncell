import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  products: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      price: number;
      purchasePrice: number;
    };
    indexes: { 'by-name': string };
  };
  sales: {
    key: string;
    value: {
      id: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
      subtotal: number;
      total: number;
      discount: number;
      paymentReceived: number;
      change: number;
      date: string;
      cashier: string;
      storeLocation: string;
    };
    indexes: { 'by-date': string };
  };
  orders: {
    key: string;
    value: {
      id: string;
      customerName: string;
      contactNumber: string;
      email: string;
      deliveryAddress: string;
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
      }>;
      totalAmount: number;
      discount: number;
      advancePayment: number;
      finalAmount: number;
      status: string;
      paymentMethod: string;
      orderDate: string;
      notes: string;
    };
    indexes: { 'by-status': string; 'by-date': string };
  };
  users: {
    key: string;
    value: {
      id: string;
      username: string;
      fullName: string;
      email: string;
      role: string;
      createdAt: string;
      lastLogin: string;
    };
    indexes: { 'by-username': string };
  };
}

let db: IDBPDatabase<MyDB>;

export const initDB = async () => {
  if (!db) {
    db = await openDB<MyDB>('easytech-master-stock', 1, {
      upgrade(db) {
        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('by-name', 'name');
        }

        // Sales store
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('by-date', 'date');
        }

        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('by-status', 'status');
          ordersStore.createIndex('by-date', 'orderDate');
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('by-username', 'username', { unique: true });
        }
      },
    });
  }
  return db;
};

export const getAll = async <T extends keyof MyDB>(storeName: T): Promise<Array<MyDB[T]['value']>> => {
  try {
    const db = await initDB();
    return await db.getAll(storeName);
  } catch (error) {
    console.error(`Error getting all items from ${storeName}:`, error);
    return [];
  }
};

export const get = async <T extends keyof MyDB>(storeName: T, id: string): Promise<MyDB[T]['value'] | undefined> => {
  try {
    const db = await initDB();
    return await db.get(storeName, id);
  } catch (error) {
    console.error(`Error getting item from ${storeName}:`, error);
    return undefined;
  }
};

export const add = async <T extends keyof MyDB>(storeName: T, item: MyDB[T]['value']): Promise<string> => {
  try {
    const db = await initDB();
    await db.add(storeName, item);
    return item.id;
  } catch (error) {
    console.error(`Error adding item to ${storeName}:`, error);
    throw error;
  }
};

export const put = async <T extends keyof MyDB>(storeName: T, item: MyDB[T]['value']): Promise<string> => {
  try {
    const db = await initDB();
    await db.put(storeName, item);
    return item.id;
  } catch (error) {
    console.error(`Error updating item in ${storeName}:`, error);
    throw error;
  }
};

export const remove = async <T extends keyof MyDB>(storeName: T, id: string): Promise<void> => {
  try {
    const db = await initDB();
    await db.delete(storeName, id);
  } catch (error) {
    console.error(`Error deleting item from ${storeName}:`, error);
    throw error;
  }
};

export const clear = async <T extends keyof MyDB>(storeName: T): Promise<void> => {
  try {
    const db = await initDB();
    await db.clear(storeName);
  } catch (error) {
    console.error(`Error clearing ${storeName}:`, error);
    throw error;
  }
};

export const getAllByIndex = async <T extends keyof MyDB>(
  storeName: T,
  indexName: string,
  query: IDBKeyRange | null = null
): Promise<Array<MyDB[T]['value']>> => {
  try {
    const db = await initDB();
    return await db.getAllFromIndex(storeName, indexName, query);
  } catch (error) {
    console.error(`Error getting items by index from ${storeName}:`, error);
    return [];
  }
};

export default {
  initDB,
  getAll,
  get,
  add,
  put,
  remove,
  clear,
  getAllByIndex,
};