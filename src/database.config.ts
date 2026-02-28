/**
 * Parses DATABASE_URL. Supports:
 * - Public IP: postgresql://user:pass@host:5432/db (SSL for Cloud SQL)
 * - Cloud Run socket: postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE
 */
function parseDatabaseUrl(): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  useSsl: boolean;
} {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const hasQuery = databaseUrl.includes('?');
  const [urlPart, queryPart] = hasQuery ? databaseUrl.split('?') : [databaseUrl, ''];
  const urlWithoutQuery = urlPart.replace(/\?.*$/, '');
  const parsed = new URL(urlWithoutQuery.replace(/^postgresql:\/\//, 'https://'));
  const database = (parsed.pathname?.slice(1) || '').replace(/%2F/g, '/');

  const params = new URLSearchParams(queryPart || '');
  const socketHost = params.get('host');
  const isSocket = typeof socketHost === 'string' && socketHost.startsWith('/cloudsql/');

  return {
    host: isSocket ? socketHost : parsed.hostname,
    port: parseInt(parsed.port || '5432', 10),
    username: parsed.username,
    password: parsed.password,
    database,
    useSsl: !isSocket,
  };
}

export const databaseConfig = parseDatabaseUrl();
