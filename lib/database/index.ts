import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('breakdex.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  // Create moves table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS moves (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      learningState TEXT DEFAULT 'NEW',
      category TEXT DEFAULT 'default',
      videoPath TEXT,
      originalVideoName TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      archivedAt TEXT,
      archiveReason TEXT
    );
  `);
  
  // Create combos table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS combos (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);
  
  // Create combo_moves (junction table)
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS combo_moves (
      id TEXT PRIMARY KEY NOT NULL,
      comboId TEXT NOT NULL,
      moveId TEXT NOT NULL,
      position INTEGER NOT NULL,
      FOREIGN KEY (comboId) REFERENCES combos(id) ON DELETE CASCADE,
      FOREIGN KEY (moveId) REFERENCES moves(id) ON DELETE CASCADE
    );
  `);
  
  // Create fsrs_cards table for spaced repetition
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS fsrs_cards (
      id TEXT PRIMARY KEY NOT NULL,
      moveId TEXT NOT NULL UNIQUE,
      due TEXT NOT NULL,
      interval INTEGER DEFAULT 0,
      easeFactor REAL DEFAULT 2.5,
      repetitions INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      state INTEGER DEFAULT 0,
      FOREIGN KEY (moveId) REFERENCES moves(id) ON DELETE CASCADE
    );
  `);
  
  // Create decks table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
  
  // Create deck_moves (junction table)
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS deck_moves (
      id TEXT PRIMARY KEY NOT NULL,
      deckId TEXT NOT NULL,
      moveId TEXT NOT NULL,
      FOREIGN KEY (deckId) REFERENCES decks(id) ON DELETE CASCADE,
      FOREIGN KEY (moveId) REFERENCES moves(id) ON DELETE CASCADE
    );
  `);
  
  // Create aura_links for flow graph
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS aura_links (
      id TEXT PRIMARY KEY NOT NULL,
      fromMoveId TEXT NOT NULL,
      toMoveId TEXT NOT NULL,
      preset TEXT,
      FOREIGN KEY (fromMoveId) REFERENCES moves(id) ON DELETE CASCADE,
      FOREIGN KEY (toMoveId) REFERENCES moves(id) ON DELETE CASCADE
    );
  `);
}

// Move operations
export async function getAllMoves() {
  const database = await getDatabase();
  return database.getAllAsync<{
    id: string;
    name: string;
    learningState: string;
    category: string;
    videoPath: string | null;
    originalVideoName: string | null;
    notes: string | null;
    createdAt: string;
    archivedAt: string | null;
    archiveReason: string | null;
  }>('SELECT * FROM moves WHERE archivedAt IS NULL ORDER BY createdAt DESC');
}

export async function insertMove(move: {
  id: string;
  name: string;
  learningState: string;
  category: string;
  videoPath: string | null;
  originalVideoName: string | null;
  notes: string | null;
  createdAt: string;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO moves (id, name, learningState, category, videoPath, originalVideoName, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [move.id, move.name, move.learningState, move.category, move.videoPath, move.originalVideoName, move.notes, move.createdAt]
  );
}

export async function updateMove(id: string, updates: Partial<{
  name: string;
  learningState: string;
  category: string;
  videoPath: string | null;
  originalVideoName: string | null;
  notes: string | null;
}>) {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.learningState !== undefined) { fields.push('learningState = ?'); values.push(updates.learningState); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.videoPath !== undefined) { fields.push('videoPath = ?'); values.push(updates.videoPath); }
  if (updates.originalVideoName !== undefined) { fields.push('originalVideoName = ?'); values.push(updates.originalVideoName); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  
  if (fields.length > 0) {
    values.push(id);
    await database.runAsync(`UPDATE moves SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export async function deleteMove(id: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM moves WHERE id = ?', [id]);
}

export async function archiveMove(id: string, reason: string) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE moves SET archivedAt = ?, archiveReason = ? WHERE id = ?',
    [new Date().toISOString(), reason, id]
  );
}

export async function restoreMove(id: string) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE moves SET archivedAt = NULL, archiveReason = NULL WHERE id = ?',
    [id]
  );
}

export async function updateMoveFields(id: string, updates: {
  name?: string;
  learningState?: string;
  category?: string;
  videoPath?: string | null;
  originalVideoName?: string | null;
  notes?: string | null;
  archivedAt?: string | null;
  archiveReason?: string | null;
}) {
  const database = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.learningState !== undefined) { fields.push('learningState = ?'); values.push(updates.learningState); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.videoPath !== undefined) { fields.push('videoPath = ?'); values.push(updates.videoPath); }
  if (updates.originalVideoName !== undefined) { fields.push('originalVideoName = ?'); values.push(updates.originalVideoName); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (updates.archivedAt !== undefined) { fields.push('archivedAt = ?'); values.push(updates.archivedAt); }
  if (updates.archiveReason !== undefined) { fields.push('archiveReason = ?'); values.push(updates.archiveReason); }
  
  if (fields.length > 0) {
    values.push(id);
    await database.runAsync(`UPDATE moves SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

// FSRS Card operations
export async function getFsrsCard(moveId: string) {
  const database = await getDatabase();
  return database.getFirstAsync<{
    id: string;
    moveId: string;
    due: string;
    interval: number;
    easeFactor: number;
    repetitions: number;
    lapses: number;
    state: number;
  }>('SELECT * FROM fsrs_cards WHERE moveId = ?', [moveId]);
}

export async function upsertFsrsCard(card: {
  id: string;
  moveId: string;
  due: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lapses: number;
  state: number;
}) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO fsrs_cards (id, moveId, due, interval, easeFactor, repetitions, lapses, state)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(moveId) DO UPDATE SET
       due = excluded.due,
       interval = excluded.interval,
       easeFactor = excluded.easeFactor,
       repetitions = excluded.repetitions,
       lapses = excluded.lapses,
       state = excluded.state`,
    [card.id, card.moveId, card.due, card.interval, card.easeFactor, card.repetitions, card.lapses, card.state]
  );
}

// Flow graph (aura) operations
export async function getAuraLinks(moveId: string) {
  const database = await getDatabase();
  return database.getAllAsync<{
    id: string;
    fromMoveId: string;
    toMoveId: string;
    preset: string | null;
  }>('SELECT * FROM aura_links WHERE fromMoveId = ? OR toMoveId = ?', [moveId, moveId]);
}

export async function addAuraLink(link: {
  id: string;
  fromMoveId: string;
  toMoveId: string;
  preset: string | null;
}) {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO aura_links (id, fromMoveId, toMoveId, preset) VALUES (?, ?, ?, ?)',
    [link.id, link.fromMoveId, link.toMoveId, link.preset]
  );
}

export async function removeAuraLink(id: string) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM aura_links WHERE id = ?', [id]);
}