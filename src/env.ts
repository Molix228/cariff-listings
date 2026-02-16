import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  getOsEnv,
  getOsEnvOptional,
  toNumber,
} from './utils/env/env-extentions';

dotenv.config({
  path: path.join(__dirname, '../.env.development'),
});

export const env = {
  node: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopmet: process.env.NODE_ENV === 'development',
  db: {
    type: 'postgres',
    host: getOsEnv('DB_HOST'),
    port: toNumber(getOsEnvOptional('DB_PORT') || '5432'),
    username: getOsEnvOptional('DB_USERNAME'),
    password: getOsEnvOptional('DB_PASSWORD'),
    database: getOsEnv('DB_NAME'),
    ssl: {
      rejectUnauthorized: getOsEnv('REMOTE_DB') === 'true' ? false : undefined,
    },
  },
  kafka: {
    kafkaBroker: getOsEnv('KAFKA_BROKER'),
  },
};
