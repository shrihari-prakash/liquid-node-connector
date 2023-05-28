class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
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
            this.cachePrefix = `liquid_node_connector.`;
            this.cacheClient = cacheOptions.client;
            this.cacheExpiry = cacheOptions.expire || 300; // 5 minutes default
        }
        this.logger = logger || new Logger();
    }

    async authenticate(token) {
        if (!token) {
            throw new UnauthorizedError();
        };
        const cacheKey = `${this.cachePrefix}${token}`;
        if (this.redisClient) {
            const userInfo = await this.redisClient.get(cacheKey);
            if (userInfo) {
                return JSON.parse(userInfo);
            }
        }
        const api = `${this.host}/user/me`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const res = await fetch(api, { headers });
        const data = await res.json();
        if (res.status !== 200 || !data.ok) {
            throw new UnauthorizedError();
        }
        const user = data.data.user;
        if (this.redisClient) {
            const cacheData = JSON.stringify(data);
            await this.redisClient.set(cacheKey, cacheData, "EX", this.cacheExpiry);
            this.logger.debug(`User data for ${user._id} cached.`)
        }
        return user;
    }
}

module.exports = LiquidConnector;