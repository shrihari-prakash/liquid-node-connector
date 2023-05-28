## Liquid Node Connector

> **_NOTE:_** This project is in very early stages. Functionality might be limited.

### Documentation

#### Initialization

``` js
import LiquidConnector from "liquid-node-connector";

const liquidConnector = new LiquidConnector({
  host: "host_address_of_your_liquid_instance",
  clientId: "your_liquid_client_id",
  clientSecret: "your_liquid_client_secret",
  // Optional
  cacheOptions: {
    redisClient: IORedisClient,
    expire: 300 // 5 minutes
  },
  // Optional
  loggerOptions: {
    logger: console // Or any other logger that has debug, info, warn and error functions.
  }
});
```

#### Authenticate a user

``` js
const user = await liquidConnector.authenticate(token);
// Now use this user info for the rest of your logic
```
