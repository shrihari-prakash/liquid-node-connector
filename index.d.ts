interface UserInfo {
  [key: string]: any;
}

interface CacheOptions {
  redisClient: any;
  expire: number;
}

interface LoggerOptions {
  logger: any;
}

interface ConnectorOptions {
  host: string;
  clientId: string;
  clientSecret: string;
  cacheOptions?: CacheOptions;
  loggerOptions?: LoggerOptions;
}

class UnauthorizedError extends Error {
  name = "UnauthorizedError";
}

declare module "liquid-node-connector" {
  export default class LiquidConnector {
    constructor(ConnectorOptions);
    authenticate(token: string): Promise<UserInfo>;
  }
}
