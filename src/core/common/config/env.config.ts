import * as process from 'process';

export const getEnvConfig = () => ({
  secrets: {},
  database: {},
  settings: {
    expirationUrl: process.env.EXPIRATION_URL,
    sizeRandomString: process.env.SIZE_RANDOM_STRING,
  },
});
export type ConfigEnvType = ReturnType<typeof getEnvConfig>;
