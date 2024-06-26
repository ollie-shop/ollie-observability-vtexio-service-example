# Example of @ollie-dev/vtex-io-logger in the VTEX IO "Service Example App"

The purpose of this repo is to how quickly do the setup of the [**@ollie-dev/vtex-io-logger**](https://www.npmjs.com/package/@ollie-dev/vtex-io-logger) which is a npm package designed to enhance the logging and observability capabilities for VTEX IO developers and merchants.

This repo is a copy of the [**VTEX IO Service Example App**](https://github.com/vtex-apps/service-example), with the necessary modifications to include the Ollie Logger.

From the documentation of the Ollie Logger you have an example of the **Basic Usage**

Simply import and use `withFullLogger` to add logging to your service:

```typescript
import { withFullLogger } from "@ollie-dev/vtex-io-logger";

// Your service setup
const service = new Service({
  // ... your configurations
});

export default withFullLogger(service);
```

In the Service Example app you can apply this to the `node/index.ts` file

```typescript
import type { ClientsConfig, RecorderState } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import type { ContextWithOllie } from '@ollie-dev/vtex-io-logger'
import { withFullLogger } from '@ollie-dev/vtex-io-logger'

import { Clients } from './clients'
import { status } from './middlewares/status'
import { validate } from './middlewares/validate'
import logger from './utils/logger'

const TIMEOUT_MS = 800
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    status: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ContextWithOllie<Clients, State>
  interface State extends RecorderState {
    code: number
  }
}

const service = new Service({
  clients,
  routes: {
    status: method({
      GET: [validate, status],
    }),
  },
})

export default withFullLogger(service, { logger })
```

Once this step is done, the "Service" will start to be logged

## Connecting with External Loggers

Now the next step is to connect your app with an external logging systems like OpenSearch.

We use [**Pino**](https://www.npmjs.com/package/pino-opensearch) as the logger and Pino already has these packages that can stream data to various systems. 

It is important to note that you can stream the logs anywhere. This is up to you. 

Howeber, If you don't have a Datalake, you can contact Ollie to subscribe to the Ollie Data Studio, where we provide a managed services suite using Grafana and Opensearch. The example below is a configuration of the Ollie Data Studio Opensearch.

```typescript
import pino from 'pino'
import pinoOpenSearch from 'pino-opensearch'

const streamToOpenSearch = pinoOpenSearch({
  index: 'OLLIE_OBSERVABILITY_OPENSEARCH_INDEX',
  node: 'OLLIE_OBSERVABILITY_OPENSEARCH_URL',
  'es-version': 7,
  'flush-bytes': 1000,
  'flush-interval': 5000,
  auth: {
    username: 'OLLIE_OBSERVABILITY_OPENSEARCH_USERNAME',
    password: 'OLLIE_OBSERVABILITY_OPENSEARCH_PASSWORD',
  },
})

streamToOpenSearch.on('insertError', (error: { document: any }) => {
  const documentThatFailed = error.document
  console.log(`An error occurred insert document:`, documentThatFailed)
})

streamToOpenSearch.on('unknown', (line: any, error: any) =>
  console.log(
    'Expect to see a lot of these with Pino Pretty turned on.',
    error,
    line
  )
)

// Capture errors like unable to connect Elasticsearch instance.
streamToOpenSearch.on('error', (error: any) => {
  console.error('Opensearch client error:', error)
})
// Capture errors returned from Elasticsearch, "it will be called every time a document can't be indexed".
streamToOpenSearch.on('insertError', (error: any) => {
  console.error('Opensearch server error:', error)
})

const logger = pino(
  { level: 'info' || 'warn' || 'error' || 'debug' },
  streamToOpenSearch
)

export default logger
```

## Create an outbound access policy to your external URL
Considering that this is a VTEX IO app, The last step is for you to allow the app to connect with external endpoints. This is done in the `manifest.json` file.
Here you should include the URL of the system the logs will be sent to. In the example below its the URL of the Ollie Data Studio. 

```
"policies": [
   ...
    {
      "name": "outbound-access",
      "attrs": {
        "host": "search-ollieflare-milb6ca7dh6v2kpfbai45ovh5u.us-east-1.es.amazonaws.com",
        "path": "*"
      }
    },
  ...
```

## Visualizing your logs

If you are a customer of Ollie Data Studio you should be able to query your logs and create your own dashboards
<img width="1629" alt="image" src="https://github.com/ollie-shop/ollie-observability-vtexio-service-example/assets/23402009/f5d53b11-06a2-48c5-85d1-d76d7d43459b">

