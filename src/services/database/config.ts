import { createClient } from '@supabase/supabase-js';
import { Database } from 'better-sqlite3';
import { initSchema } from './schema';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// SQLite configuration
let sqliteDb: Database | null = null;

export const initSQLite = async () => {
  if (!sqliteDb) {
    sqliteDb = new Database(':memory:', { verbose: console.log });
    await initSchema(sqliteDb);
  }
  return sqliteDb;
};

// Check online status
export const isOnline = () => navigator.onLine;

// Initialize database connection
export const initDatabase = async () => {
  try {
    // Initialize SQLite
    const db = await initSQLite();

    // Set up online/offline listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Handle online event
const handleOnline = async () => {
  console.log('Application is online');
  await syncData();
};

// Handle offline event
const handleOffline = () => {
  console.log('Application is offline');
};

// Sync data between SQLite and Supabase
export const syncData = async () => {
  if (!isOnline() || !sqliteDb) return;

  try {
    // Get all tables
    const tables = await sqliteDb.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();

    // Sync each table
    for (const { name } of tables) {
      const localData = await sqliteDb.prepare(`SELECT * FROM ${name}`).all();
      const { data: remoteData, error } = await supabase.from(name).select('*');

      if (error) throw error;

      // Compare and sync data
      const localIds = new Set(localData.map(item => item.id));
      const remoteIds = new Set(remoteData?.map(item => item.id));

      // Upload local changes
      const localOnly = localData.filter(item => !remoteIds.has(item.id));
      if (localOnly.length > 0) {
        const { error: uploadError } = await supabase.from(name).upsert(localOnly);
        if (uploadError) throw uploadError;
      }

      // Download remote changes
      const remoteOnly = remoteData?.filter(item => !localIds.has(item.id)) || [];
      if (remoteOnly.length > 0) {
        const placeholders = remoteOnly.map(() => '(?)').join(',');
        const stmt = sqliteDb.prepare(
          `INSERT OR REPLACE INTO ${name} VALUES ${placeholders}`
        );
        stmt.run(...remoteOnly);
      }
    }

    console.log('Data sync completed');
  } catch (error) {
    console.error('Error syncing data:', error);
    throw error;
  }
};

export default {
  supabase,
  initDatabase,
  isOnline,
  syncData
};