import fs from "fs";
import path from "path";
import initSqlJs, {
  type Database,
  type SqlJsStatic,
  type SqlValue,
} from "sql.js";
import mysql, {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { resolveDbFilePath } from "@/lib/settings";

export type DbUser = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
};

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

/** sqlite (varsayılan, sunucusuz) | mysql (XAMPP isteğe bağlı) */
export function dbDriver(): "sqlite" | "mysql" {
  const d = env("DB_DRIVER", "sqlite").toLowerCase();
  return d === "mysql" ? "mysql" : "sqlite";
}

function sqliteFile() {
  return resolveDbFilePath();
}

/* -------------------- SQLite (sql.js — native derleme yok) -------------------- */

let SQL: SqlJsStatic | null = null;
let sqliteDb: Database | null = null;
let sqliteReady = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

async function loadSqlJs() {
  if (SQL) return SQL;

  // Turbopack: dinamik resolve kullanma — sabit aday yollar
  const distDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "node_modules",
    "sql.js",
    "dist",
  );
  const wasmFile = path.join(distDir, "sql-wasm.wasm");

  SQL = await initSqlJs({
    locateFile: (file) => {
      const candidate = path.join(distDir, file);
      if (fs.existsSync(candidate)) return candidate;
      if (file.endsWith(".wasm") && fs.existsSync(wasmFile)) return wasmFile;
      return file;
    },
  });
  return SQL;
}

function persistSqlite() {
  if (!sqliteDb) return;
  const file = sqliteFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const data = sqliteDb.export();
  fs.writeFileSync(file, Buffer.from(data));
}

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      persistSqlite();
    } catch (err) {
      console.error("sqlite persist", err);
    }
  }, 120);
}

export function resetSqliteConnection() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (sqliteDb) {
    try {
      persistSqlite();
      sqliteDb.close();
    } catch {
      /* ignore */
    }
    sqliteDb = null;
    sqliteReady = false;
  }
}

export function getActiveSqlitePath() {
  return sqliteFile();
}

async function getSqlite(): Promise<Database> {
  if (sqliteDb) return sqliteDb;
  const sql = await loadSqlJs();
  const file = sqliteFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) {
    const buf = fs.readFileSync(file);
    sqliteDb = new sql.Database(buf);
  } else {
    sqliteDb = new sql.Database();
  }
  return sqliteDb;
}

async function ensureSqliteSchema() {
  const db = await getSqlite();
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS workspaces (
      user_id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  schedulePersist();
  sqliteReady = true;
}

/* -------------------- MySQL (opsiyonel) -------------------- */

let pool: Pool | null = null;
let mysqlSchemaReady: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env("MYSQL_HOST", "127.0.0.1"),
      port: Number(env("MYSQL_PORT", "3306")),
      user: env("MYSQL_USER", "root"),
      password: env("MYSQL_PASSWORD", ""),
      database: env("MYSQL_DATABASE", "note"),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

async function ensureMysqlSchema() {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(120) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at BIGINT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      user_id INT UNSIGNED NOT NULL,
      data JSON NOT NULL,
      updated_at BIGINT NOT NULL,
      PRIMARY KEY (user_id),
      CONSTRAINT fk_workspaces_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function readyDb() {
  if (dbDriver() === "sqlite") {
    if (!sqliteReady) await ensureSqliteSchema();
    return;
  }
  if (!mysqlSchemaReady) {
    mysqlSchemaReady = ensureMysqlSchema().catch((err) => {
      mysqlSchemaReady = null;
      throw err;
    });
  }
  await mysqlSchemaReady;
}

function sqliteGet<T>(
  db: Database,
  sql: string,
  params: SqlValue[] = [],
): T | null {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject() as T;
  stmt.free();
  return row;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await readyDb();
  const normalized = email.toLowerCase().trim();

  if (dbDriver() === "sqlite") {
    const db = await getSqlite();
    return sqliteGet<DbUser>(
      db,
      "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
      [normalized],
    );
  }

  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE email = :email LIMIT 1",
    { email: normalized },
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function findUserById(
  id: number,
): Promise<Omit<DbUser, "password_hash"> | null> {
  await readyDb();

  if (dbDriver() === "sqlite") {
    const db = await getSqlite();
    return sqliteGet<Omit<DbUser, "password_hash">>(
      db,
      "SELECT id, email, name, created_at FROM users WHERE id = ? LIMIT 1",
      [id],
    );
  }

  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, email, name, created_at FROM users WHERE id = :id LIMIT 1",
    { id },
  );
  return (rows[0] as Omit<DbUser, "password_hash"> | undefined) ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<number> {
  await readyDb();
  const email = input.email.toLowerCase().trim();
  const name = input.name.trim();
  const createdAt = Date.now();

  if (dbDriver() === "sqlite") {
    const db = await getSqlite();
    db.run(
      `INSERT INTO users (email, name, password_hash, created_at)
       VALUES (?, ?, ?, ?)`,
      [email, name, input.passwordHash, createdAt],
    );
    const row = sqliteGet<{ id: number }>(db, "SELECT last_insert_rowid() AS id");
    schedulePersist();
    return Number(row?.id ?? 0);
  }

  const [result] = await getPool().query<ResultSetHeader>(
    `INSERT INTO users (email, name, password_hash, created_at)
     VALUES (:email, :name, :passwordHash, :createdAt)`,
    {
      email,
      name,
      passwordHash: input.passwordHash,
      createdAt,
    },
  );
  return result.insertId;
}

export async function getWorkspaceData(
  userId: number,
): Promise<unknown | null> {
  await readyDb();

  if (dbDriver() === "sqlite") {
    const db = await getSqlite();
    const row = sqliteGet<{ data: string }>(
      db,
      "SELECT data FROM workspaces WHERE user_id = ? LIMIT 1",
      [userId],
    );
    if (!row?.data) return null;
    try {
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  }

  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT data FROM workspaces WHERE user_id = :userId LIMIT 1",
    { userId },
  );
  const row = rows[0] as { data: unknown } | undefined;
  if (!row) return null;
  if (typeof row.data === "string") {
    try {
      return JSON.parse(row.data);
    } catch {
      return null;
    }
  }
  return row.data;
}

export async function saveWorkspaceData(
  userId: number,
  data: unknown,
): Promise<void> {
  await readyDb();
  const payload = JSON.stringify(data);
  const updatedAt = Date.now();

  if (dbDriver() === "sqlite") {
    const db = await getSqlite();
    db.run(
      `INSERT INTO workspaces (user_id, data, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         data = excluded.data,
         updated_at = excluded.updated_at`,
      [userId, payload, updatedAt],
    );
    schedulePersist();
    return;
  }

  await getPool().query(
    `INSERT INTO workspaces (user_id, data, updated_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
    [userId, payload, updatedAt],
  );
}
