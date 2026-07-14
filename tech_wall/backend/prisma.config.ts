import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { defineConfig, env } from 'prisma/config';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
