import { Pool } from "pg";
import { config } from "./env";

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  ssl: { rejectUnauthorized: false }, // Required for RDS usually
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
