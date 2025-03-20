/* eslint-disable no-console */
import pino from 'pino'

const transport = pino.transport({
  target: '@serdnam/pino-cloudwatch-transport',
  options: {
    logGroupName: 'OllieVTEXIOObservability',
    logStreamName: `OLLIE_OBSERVABILITY_CLOUDWATCH_LOG_STREAM_${new Date().toISOString()}`,
    awsRegion: 'us-east-1',
    awsAccessKeyId: 'ASIAQS3GELX7EIBUU7MG',
    awsSecretAccessKey: 'EkH3wnYEjUmCgA1n9BmfoIRw0nenExt3c8U639q6',
    interval: 5000, // Enviar logs a cada 5 segundos
    batchSize: 1000, // Tamanho máximo do lote em bytes
  }
})

// Captura erros não tratados durante o envio para CloudWatch
process.on('uncaughtException', (error: Error) => {
  console.error('Falha ao enviar logs para CloudWatch:', error)
})

const logger = pino(
  { level: process.env.LOG_LEVEL || 'warn' },
  transport
)

export default logger
