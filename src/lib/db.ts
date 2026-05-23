import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let dbSingleton: Database.Database | null = null;

function ensureDataDir(): string {
  const dataDir = path.join(process.cwd(), ".raganza");
  fs.mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

export function getDb(): Database.Database {
  if (dbSingleton) return dbSingleton;

  const dataDir = ensureDataDir();
  const dbPath = path.join(dataDir, "auth.db");
  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  dbSingleton = db;
  return db;
}

