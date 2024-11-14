import { Database } from 'better-sqlite3';
import { supabase } from './config';

interface TableSchema {
  name: string;
  columns: {
    [key: string]: string;
  };
  indexes?: string[];
}

const DEFAULT_SCHEMAS: TableSchema[] = [
  {
    name: 'users',
    columns: {
      id: 'TEXT PRIMARY KEY',
      username: 'TEXT NOT NULL UNIQUE',
      email: 'TEXT NOT NULL UNIQUE',
      password: 'TEXT NOT NULL',
      role: 'TEXT NOT NULL',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    indexes: ['username', 'email']
  },
  {
    name: 'products',
    columns: {
      id: 'TEXT PRIMARY KEY',
      name: 'TEXT NOT NULL',
      description: 'TEXT',
      price: 'REAL NOT NULL',
      quantity: 'INTEGER NOT NULL DEFAULT 0',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    indexes: ['name']
  },
  {
    name: 'sales',
    columns: {
      id: 'TEXT PRIMARY KEY',
      customer_id: 'TEXT',
      total: 'REAL NOT NULL',
      status: 'TEXT NOT NULL',
      created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    },
    indexes: ['customer_id', 'status']
  }
];

// Initialize schema for both SQLite and Supabase
export const initSchema = async (db: Database) => {
  try {
    // Create tables in SQLite
    for (const schema of DEFAULT_SCHEMAS) {
      await createTable(db, schema);
    }

    // Create tables in Supabase if they don't exist
    if (navigator.onLine) {
      for (const schema of DEFAULT_SCHEMAS) {
        await createSupabaseTable(schema);
      }
    }
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  }
};

// Create table in SQLite
const createTable = async (db: Database, schema: TableSchema) => {
  const columns = Object.entries(schema.columns)
    .map(([name, type]) => `${name} ${type}`)
    .join(', ');

  try {
    // Create table
    db.prepare(`CREATE TABLE IF NOT EXISTS ${schema.name} (${columns})`).run();

    // Create indexes
    if (schema.indexes) {
      for (const column of schema.indexes) {
        db.prepare(
          `CREATE INDEX IF NOT EXISTS idx_${schema.name}_${column} ON ${schema.name}(${column})`
        ).run();
      }
    }
  } catch (error) {
    console.error(`Error creating table ${schema.name}:`, error);
    throw error;
  }
};

// Create table in Supabase
const createSupabaseTable = async (schema: TableSchema) => {
  try {
    // Convert SQLite schema to PostgreSQL
    const columns = Object.entries(schema.columns)
      .map(([name, type]) => {
        // Convert SQLite types to PostgreSQL
        const pgType = type
          .replace('TEXT', 'varchar')
          .replace('REAL', 'decimal')
          .replace('INTEGER', 'integer')
          .replace('DATETIME', 'timestamp');
        return `${name} ${pgType}`;
      })
      .join(', ');

    // Create table if not exists
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: schema.name,
      definition: columns
    });

    if (error) throw error;

    // Create indexes
    if (schema.indexes) {
      for (const column of schema.indexes) {
        await supabase.rpc('create_index_if_not_exists', {
          table_name: schema.name,
          column_name: column
        });
      }
    }
  } catch (error) {
    console.error(`Error creating Supabase table ${schema.name}:`, error);
    throw error;
  }
};

// Add new table dynamically
export const addTable = async (db: Database, schema: TableSchema) => {
  try {
    // Create table in SQLite
    await createTable(db, schema);

    // Create table in Supabase if online
    if (navigator.onLine) {
      await createSupabaseTable(schema);
    }

    // Add schema to DEFAULT_SCHEMAS for future reference
    DEFAULT_SCHEMAS.push(schema);
  } catch (error) {
    console.error('Error adding new table:', error);
    throw error;
  }
};

export default {
  initSchema,
  addTable,
  DEFAULT_SCHEMAS
};