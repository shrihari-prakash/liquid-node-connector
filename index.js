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
            throw new LiquidUnauthorizedError();
        };
        const cacheKey = `${this.cachePrefix}token:${token}`;
        if (this.cacheClient) {
            let cacheResult = await this.cacheClient.get(cacheKey);
            if (cacheResult) {
                cacheResult = JSON.parse(cacheResult);
                this.logger.debug(`Returning response from cache for ${cacheKey}`);
                if (cacheResult.ok === 1) {
                    return cacheResult.data.user;
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
            throw new LiquidUnauthorizedError();
        }
        const user = result.data.user;
        return user;
    }
}

module.exports = LiquidConnector;