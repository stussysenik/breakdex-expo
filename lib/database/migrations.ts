import * as SQLite from "expo-sqlite";
import { createSchema, setDatabase } from "./index";

const TARGET_VERSION = 1;

export async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  setDatabase(database);

  const row = database.getFirstSync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= TARGET_VERSION) return;

  database.execSync("PRAGMA journal_mode = WAL");
  createSchema(database);
  database.execSync(`PRAGMA user_version = ${TARGET_VERSION}`);
}
