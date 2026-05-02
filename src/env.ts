import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  getOsEnv,
  getOsEnvOptional,
  toNumber,
} from './utils/env/env-extentions';

const envName =
  process.env.NODE_ENV === 'production' ? '.env' : '.env.development';
const envPath = path.resolve(process.cwd(), envName);
console.log('Loading env from:', envPath);

dotenv.config({
  path: path.join(envPath),
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
      rejectUnauthorized: getOsEnvOptional('REMOTE_DB') === 'true' ? false : undefined,
    },
  },
  kafka: {
    kafkaBroker: getOsEnv('KAFKA_BROKER'),
  },
  redis: {
    host: getOsEnvOptional('REDIS_HOST'),
    port: toNumber(getOsEnvOptional('REDIS_PORT') || '6379'),
  },
  apiGateway: {
    url: getOsEnvOptional('API_GATEWAY_URL'),
    service_token: getOsEnvOptional('INTERNAL_SERVICE_TOKEN'),
  },
};
