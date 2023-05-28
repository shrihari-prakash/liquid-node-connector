## Liquid Node Connector

A Node.js connector library to integrate your microservices with [Liquid](https://github.com/shrihari-prakash/liquid) authentication services. This library requires Node version 18 or above.

> **_NOTE:_** This project is in very early stages. Functionality might be limited.

### Usage

#### Installation

Run `npm i liquid-node-connector`.
### Usage

#### Initialization

```js
import LiquidConnector from "liquid-node-connector";

const liquidConnector = new LiquidConnector({
  host: "host_address_of_your_liquid_instance",
  clientId: "your_liquid_client_id",
  clientSecret: "your_liquid_client_secret",
  // Optional
  cacheOptions: {
    client: RedisClient,
    expire: 300, // 5 minutes
  },
  // Optional
  logger: console, // Or any other logger that has debug, info, warn and error functions.
});
```

#### Authenticate a user

```js
const user = await liquidConnector.authenticate(token);
// Now use this user info for the rest of your logic.
```

#### Get access token for the client initialized

```js
const { accessToken } = await liquidConnector.getAccessToken();
// Make APIs calls that requires client authentication.
```
