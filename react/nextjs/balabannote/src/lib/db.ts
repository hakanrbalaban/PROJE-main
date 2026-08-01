import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function getPool(): Pool {
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

async function ensureSchema() {
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
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

export type DbUser = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: number;
};

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  await readyDb();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, email, name, password_hash, created_at FROM users WHERE email = :email LIMIT 1",
    { email: email.toLowerCase().trim() },
  );
  return (rows[0] as DbUser | undefined) ?? null;
}

export async function findUserById(id: number): Promise<Omit<DbUser, "password_hash"> | null> {
  await readyDb();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, email, name, created_at FROM users WHERE id = :id LIMIT 1",
    { id },
  );
  const row = rows[0] as Omit<DbUser, "password_hash"> | undefined;
  return row ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<number> {
  await readyDb();
  const [result] = await getPool().query<ResultSetHeader>(
    `INSERT INTO users (email, name, password_hash, created_at)
     VALUES (:email, :name, :passwordHash, :createdAt)`,
    {
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash: input.passwordHash,
      createdAt: Date.now(),
    },
  );
  return result.insertId;
}

export async function getWorkspaceData(userId: number): Promise<unknown | null> {
  await readyDb();
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

export async function saveWorkspaceData(userId: number, data: unknown): Promise<void> {
  await readyDb();
  const payload = JSON.stringify(data);
  // MariaDB/MySQL: CAST(:named AS JSON) named placeholder ile bozuluyor —
  // JSON kolonuna string vermek yeterli.
  await getPool().query(
    `INSERT INTO workspaces (user_id, data, updated_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)`,
    [userId, payload, Date.now()],
  );
}

export type { ResultSetHeader, RowDataPacket };
