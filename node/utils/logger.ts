/* eslint-disable no-console */
import pino from 'pino'
// @ts-ignore
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
