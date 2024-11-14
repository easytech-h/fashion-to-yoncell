import initSqlJs from 'sql.js';

let db: any = null;

export async function initDatabase() {
  if (db) return;

  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });

  db = new SQL.Database();

  // Initialize the database with necessary tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      discount REAL NOT NULL,
      payment_received REAL NOT NULL,
      change REAL NOT NULL,
      cashier TEXT NOT NULL,
      store_location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function runQuery(query: string, params: any[] = []) {
  const stmt = getDb().prepare(query);
  return stmt.run(params);
}

export function getAll(query: string, params: any[] = []) {
  const stmt = getDb().prepare(query);
  return stmt.getAsObject(params);
}

export function getOne(query: string, params: any[] = []) {
  const stmt = getDb().prepare(query);
  return stmt.getAsObject(params);
}

export default {
  initDatabase,
  getDb,
  runQuery,
  getAll,
  getOne,
};