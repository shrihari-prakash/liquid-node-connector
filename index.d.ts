interface UserInfo {
  [key: string]: any;
}

interface TokenResponse {
  accessToken: string;
  accessTokenExpiry: number;
}

interface CacheOptions {
  client: any;
  expire: number;
}

interface ConnectorOptions {
  host: string;
  clientId: string;
  clientSecret: string;
  cacheOptions?: CacheOptions;
  logger?: {
    debug: any;
    info: any;
    warn: any;
    error: any;
  };
}

class UnauthorizedError extends Error {
  name = "UnauthorizedError";
}

declare module "liquid-node-connector" {
  export default class LiquidConnector {
    constructor(options: ConnectorOptions);
    authenticate(token: string): Promise<UserInfo>;
    getAccessToken(): Promise<TokenResponse>;
  }
}
