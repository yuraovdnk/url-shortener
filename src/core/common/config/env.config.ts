import * as process from 'process';

export const getEnvConfig = () => ({
  secrets: {},
  database: {},
  settings: {
    expirationUrl: process.env.EXPIRATION_URL,
    sizeRandomString: process.env.SIZE_RANDOM_STRING,
    redisTtl: process.env.REDIS_TTL,
  },
});
export type ConfigEnvType = ReturnType<typeof getEnvConfig>;
