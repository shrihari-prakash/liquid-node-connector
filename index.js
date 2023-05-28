class LiquidForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LiquidForbiddenError';
    }
}

class LiquidUnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LiquidUnauthorizedError';
    }
}

class Logger {
    debug() { null }
    info() { null }
    warn() { null }
    error() { null }
}

class LiquidConnector {
    accessToken = null;
    accessTokenExpiry = new Date(0);

    constructor({ host, clientId, clientSecret, cacheOptions, logger }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.host = host;
        if (cacheOptions) {
            this.cachePrefix = `liquid_node_connector:`;
            this.cacheClient = cacheOptions.client;
            this.cacheExpiry = cacheOptions.expire || 300; // 5 minutes default
        }
        this.logger = logger || new Logger();
    }

    async authenticate(token) {
        if (!token) {
            throw new LiquidForbiddenError();
        };
        const cacheKey = `${this.cachePrefix}token:${token}`;
        if (this.cacheClient) {
            let cacheResult = await this.cacheClient.get(cacheKey);
            if (cacheResult) {
                cacheResult = JSON.parse(cacheResult);
                this.logger.debug(`Returning response from cache for ${cacheKey}`);
                if (cacheResult.ok === 1) {
                    return cacheResult.data.user;
                } else {
                    throw new LiquidForbiddenError();
                }
            }
        }
        const api = `${this.host}/user/me`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await fetch(api, { headers });
        const result = await response.json();
        if (this.cacheClient) {
            result.cacheTime = +new Date();
            const cacheData = JSON.stringify(result);
            await this.cacheClient.set(cacheKey, cacheData, "EX", this.cacheExpiry);
            this.logger.debug(`Cache written for ${cacheKey}`);
        }
        if (response.status !== 200 || !result.ok) {
            throw new LiquidForbiddenError();
        }
        const user = result.data.user;
        return user;
    }

    async getAccessToken() {
        const now = new Date();
        if (this.accessTokenExpiry.getTime() <= now.getTime()) {
            const expiry = new Date();
            const api = `${this.host}/oauth/token`;
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            const body = new URLSearchParams();
            body.append('grant_type', 'client_credentials');
            body.append('client_id', this.clientId);
            body.append('client_secret', this.clientSecret);
            const response = await fetch(api, {
                method: 'POST',
                headers,
                body
            });
            if (response.status !== 200) {
                throw new LiquidUnauthorizedError();
            }
            const result = await response.json();
            this.accessToken = result.access_token;
            expiry.setSeconds(expiry.getSeconds() + result.expires_in);
            this.accessTokenExpiry = expiry;
            this.logger.debug("Access token returned from remote.");
        } else {
            this.logger.debug("Access token returned from memory.");
        }
        return {
            accessToken: this.accessToken,
            accessTokenExpiry: this.accessTokenExpiry
        }
    }
}

module.exports = LiquidConnector;