import { Database } from 'better-sqlite3';
import { supabase } from './config';
import { TableSchema } from './schema';

interface Migration {
  id: number;
  name: string;
  timestamp: string;
}

// Initialize migrations table
export const initMigrations = async (db: Database) => {
  try {
    // Create migrations table in SQLite
    db.prepare(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create migrations table in Supabase if online
    if (navigator.onLine) {
      await supabase.rpc('create_table_if_not_exists', {
        table_name: 'migrations',
        definition: `
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `
      });
    }
  } catch (error) {
    console.error('Error initializing migrations:', error);
    throw error;
  }
};

// Run migrations
export const runMigrations = async (db: Database, migrations: Migration[]) => {
  try {
    // Get completed migrations
    const completed = db
      .prepare('SELECT name FROM migrations')
      .all()
      .map(m => m.name);

    // Run pending migrations
    for (const migration of migrations) {
      if (!completed.includes(migration.name)) {
        await runMigration(db, migration);
      }
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

// Run single migration
const runMigration = async (db: Database, migration: Migration) => {
  try {
    // Start transaction
    db.prepare('BEGIN TRANSACTION').run();

    // Run migration
    console.log(`Running migration: ${migration.name}`);
    // Add migration-specific logic here

    // Record migration
    db.prepare(
      'INSERT INTO migrations (name, timestamp) VALUES (?, CURRENT_TIMESTAMP)'
    ).run(migration.name);

    // Commit transaction
    db.prepare('COMMIT').run();

    // Sync with Supabase if online
    if (navigator.onLine) {
      const { error } = await supabase.from('migrations').insert([
        {
          name: migration.name,
          timestamp: new Date().toISOString()
        }
      ]);
      if (error) throw error;
    }
  } catch (error) {
    // Rollback on error
    db.prepare('ROLLBACK').run();
    console.error(`Error running migration ${migration.name}:`, error);
    throw error;
  }
};

// Create new migration
export const createMigration = async (
  name: string,
  schema: TableSchema
): Promise<Migration> => {
  const migration: Migration = {
    id: Date.now(),
    name: `${name}_${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  // Store migration details
  const migrationPath = `migrations/${migration.name}.json`;
  localStorage.setItem(migrationPath, JSON.stringify(schema));

  return migration;
};

export default {
  initMigrations,
  runMigrations,
  createMigration
};