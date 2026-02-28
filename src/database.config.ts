/**
 * Parses DATABASE_URL and returns TypeORM options with SSL that does not verify
 * the Cloud SQL certificate (for local dev over public IP).
 */
function parseDatabaseUrl(): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const urlWithoutQuery = databaseUrl.replace(/\?.*$/, '');
  const parsed = new URL(urlWithoutQuery.replace(/^postgresql:\/\//, 'https://'));
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '5432', 10),
    username: parsed.username,
    password: parsed.password,
    database: (parsed.pathname?.slice(1) || '').replace(/%2F/g, '/'),
  };
}

export const databaseConfig = parseDatabaseUrl();
