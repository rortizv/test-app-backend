import 'dotenv/config';
import { DataSource } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;
const urlWithoutSsl = databaseUrl?.replace(/\?.*$/, '') ?? '';
const parsed = new URL(urlWithoutSsl.replace(/^postgresql:\/\//, 'https://'));

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: parsed.hostname,
  port: parseInt(parsed.port || '5432', 10),
  username: parsed.username,
  password: parsed.password,
  database: (parsed.pathname?.slice(1) || '').replace(/%2F/g, '/'),
  ssl: { rejectUnauthorized: false },
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV !== 'production',
});
