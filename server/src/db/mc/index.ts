import mysql from "mysql2/promise";
import config from "@/config";

/**
 * MySQL connection pool for Minecraft database
 * Uses lazy initialization - only creates pool when first needed
 */
let pool: mysql.Pool | null = null;

/**
 * Connection configuration for Mc MySQL database
 */
const connectionConfig: mysql.PoolOptions = config.db.mc;

/**
 * Gets or creates the MySQL connection pool
 *
 * Implements lazy initialization to avoid maintaining constant connections
 * to the Minecraft database when not needed
 *
 * @returns MySQL connection pool instance
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    logger.debug("Creating new MySQL connection pool for Minecraft database");
    pool = mysql.createPool(connectionConfig);
  }
  return pool;
}

/**
 * Gets a connection from the pool for executing queries
 *
 * @returns Promise resolving to a MySQL connection
 * @throws Error if connection fails
 */
export async function getConnection(): Promise<mysql.PoolConnection> {
  const currentPool = getPool();
  return await currentPool.getConnection();
}

/**
 * Executes a query on the Minecraft database
 * Automatically handles connection acquisition and release
 *
 * @param sql - SQL query string
 * @param params - Query parameters for prepared statement
 * @returns Promise resolving to query results
 * @throws Error if query fails
 *
 * @example
 * const [rows] = await query<UserRow[]>(
 *   'SELECT * FROM users WHERE token = ?',
 *   [token]
 * );
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<[T, mysql.FieldPacket[]]> {
  const connection = await getConnection();

  try {
    logger.debug(`Executing MySQL query: ${sql.substring(0, 100)}...`);
    const result = await connection.query(sql, params);
    return result as [T, mysql.FieldPacket[]];
  } finally {
    connection.release();
  }
}

/**
 * Tests the database connection
 *
 * @returns Promise resolving to true if connection successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.ping();
    logger.info("Minecraft MySQL database connection successful");
    return true;
  } catch (error) {
    logger.error("Failed to connect to Minecraft MySQL database:", error);
    return false;
  }
}

/**
 * Closes all connections in the pool
 * Should be called during application shutdown
 *
 * @returns Promise resolving when all connections are closed
 */
export async function closePool(): Promise<void> {
  if (pool) {
    logger.info("Closing Minecraft MySQL connection pool");
    await pool.end();
    pool = null;
  }
}
