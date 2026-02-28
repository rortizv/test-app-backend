/**
 * Parses DATABASE_URL. Supports:
 * - Public IP: postgresql://user:pass@host:5432/db (SSL for Cloud SQL)
 * - Cloud Run socket: postgresql://user:pass@/db?host=/cloudsql/PROJECT:REGION:INSTANCE
 *
 * Node's URL constructor throws for postgresql://user:pass@/db (no host). We parse
 * the socket case manually so we never pass that form to new URL().
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
  try {
    const hasQuery = databaseUrl.includes('?');
    const [urlPart, queryPart] = hasQuery ? databaseUrl.split('?') : [databaseUrl, ''];
    const params = new URLSearchParams(queryPart || '');
    const socketHost = params.get('host');
    const isSocket = typeof socketHost === 'string' && socketHost.startsWith('/cloudsql/');

    // Socket URL: postgresql://user:pass@/database — no host, Node's new URL() throws.
    if (isSocket) {
      const match = urlPart.match(/^postgresql:\/\/([^:]+):([^@]+)@\/(.+)$/);
      if (!match) {
        throw new Error(
          'DATABASE_URL socket format must be postgresql://USER:PASSWORD@/DATABASE?host=/cloudsql/...',
        );
      }
      const [, username, password, database] = match;
      return {
        host: socketHost,
        port: 5432,
        username: decodeURIComponent(username),
        password: decodeURIComponent(password),
        database: (database || '').replace(/%2F/g, '/'),
        useSsl: false,
      };
    }

    // Standard URL with host: use URL parser (valid host present).
    const parsed = new URL(urlPart.replace(/^postgresql:\/\//, 'https://'));
    const database = (parsed.pathname?.slice(1) || '').replace(/%2F/g, '/');
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      username: parsed.username,
      password: parsed.password,
      database,
      useSsl: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const safeUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
    throw new Error(`DATABASE_URL parse failed: ${msg}. URL (masked): ${safeUrl}`);
  }
}

export const databaseConfig = parseDatabaseUrl();
