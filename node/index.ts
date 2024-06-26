import type { ClientsConfig, RecorderState } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'
import type { ContextWithOllie } from '@ollie-dev/vtex-io-logger'
import { withFullLogger } from '@ollie-dev/vtex-io-logger'

import { Clients } from './clients'
import { status } from './middlewares/status'
import { validate } from './middlewares/validate'
import logger from './utils/logger'

const TIMEOUT_MS = 800

// Create a LRU memory cache for the Status client.
// The 'max' parameter sets the size of the cache.
// The @vtex/api HttpClient respects Cache-Control headers and uses the provided cache.
// Note that the response from the API being called must include an 'etag' header
// or a 'cache-control' header with a 'max-age' value. If neither exist, the response will not be cached.
// To force responses to be cached, consider adding the `forceMaxAge` option to your client methods.
const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
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
    // `status` is the route ID from service.json. It maps to an array of middlewares (or a single handler).
    status: method({
      GET: [validate, status],
    }),
  },
})

export default withFullLogger(service, { logger })
