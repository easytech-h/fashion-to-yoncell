import { Database } from 'better-sqlite3';
import { supabase } from './config';
import { isOnline } from './config';

// Generic CRUD operations
export const create = async <T extends { id: string }>(
  db: Database,
  table: string,
  data: T
): Promise<T> => {
  try {
    // Insert into SQLite
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(
      ...values
    );

    // Insert into Supabase if online
    if (isOnline()) {
      const { error } = await supabase.from(table).insert([data]);
      if (error) throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error);
    throw error;
  }
};

export const read = async <T>(
  db: Database,
  table: string,
  id: string
): Promise<T | null> => {
  try {
    // Try to get from SQLite first
    const result = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);

    // If not found and online, try Supabase
    if (!result && isOnline()) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        // Save to SQLite for offline access
        await create(db, table, data);
        return data as T;
      }
    }

    return result as T;
  } catch (error) {
    console.error(`Error reading record from ${table}:`, error);
    throw error;
  }
};

export const update = async <T extends { id: string }>(
  db: Database,
  table: string,
  id: string,
  data: Partial<T>
): Promise<T> => {
  try {
    // Update SQLite
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(data), id];

    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values);

    // Update Supabase if online
    if (isOnline()) {
      const { error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id);
      if (error) throw error;
    }

    return { id, ...data } as T;
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error);
    throw error;
  }
};

export const remove = async (
  db: Database,
  table: string,
  id: string
): Promise<void> => {
  try {
    // Delete from SQLite
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);

    // Delete from Supabase if online
    if (isOnline()) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    }
  } catch (error) {
    console.error(`Error deleting record from ${table}:`, error);
    throw error;
  }
};

// Query operations
export const query = async <T>(
  db: Database,
  table: string,
  conditions: { [key: string]: any } = {}
): Promise<T[]> => {
  try {
    const whereClause = Object.keys(conditions).length
      ? `WHERE ${Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ')}`
      : '';
    const values = Object.values(conditions);

    const results = db
      .prepare(`SELECT * FROM ${table} ${whereClause}`)
      .all(...values);

    // If online, sync with Supabase
    if (isOnline()) {
      const query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(conditions)) {
        query.eq(key, value);
      }
      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        // Update local database with any new records
        for (const record of data) {
          if (!results.find(r => r.id === record.id)) {
            await create(db, table, record);
          }
        }
      }
    }

    return results as T[];
  } catch (error) {
    console.error(`Error querying ${table}:`, error);
    throw error;
  }
};

export default {
  create,
  read,
  update,
  remove,
  query
};