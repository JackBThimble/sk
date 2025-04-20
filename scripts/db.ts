import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../src/lib/server/db/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATBASE_URL || 'local.db';

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL is not set');
}

const client = new Database(DATABASE_URL);
export const db = drizzle(client, { schema });
