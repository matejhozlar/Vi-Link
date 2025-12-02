import { env } from "../env/env.config";

export interface McDatabaseConfig {
  // Database server hostname or IP address
  host: string;
  // Port number for MySQL connection (default is 3306)
  port: number;
  // MySQL username for authentication
  user: string;
  // MySQL password for authentication
  password: string;
  // Name of the database to connect to
  database: string;
  // Whether to queue connection requests when the pool limit is reached
  waitForConnections: boolean;
  // Maximum number of connections in the pool
  connectionLimit: number;
  // Maximum number of queued connection requests (0 = unlimited)
  queueLimit: number;
  // Whether to enable TCP keep-alive for connections
  enableKeepAlive: boolean;
  // Delay in milliseconds before starting keep-alive probes
  keepAliveInitialDelay: number;
}

const config: McDatabaseConfig = {
  host: env.MC_MYSQL_HOST,
  port: env.MC_MYSQL_PORT,
  user: env.MC_MYSQL_USER,
  password: env.MC_MYSQL_PASSWORD,
  database: env.MC_MYSQL_DATABASE,
  // Connection pool settings
  waitForConnections: true, // Queue resets instead of immediately returning error
  connectionLimit: 10, // Allow up to 10 simultaneous connections
  queueLimit: 0, // No limit on queued connection requests
  // Keep-alive settings to prevent connection timeouts
  enableKeepAlive: true, // Send periodic packets to keep connection alive
  keepAliveInitialDelay: 0, // Start keep-alive immediately after connection
};

export default config;
