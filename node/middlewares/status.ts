import { logInfo } from '../utils/applicationLog'

export async function status(ctx: Context, next: () => Promise<any>) {
  const {
    state: { code },
    clients: { status: statusClient },
  } = ctx

  // console.info('Received code:', code)

  logInfo(ctx, 'status', {
    msg: 'received code',
    code,
  })

  const statusResponse = await statusClient.getStatus(code)

  // console.info('Status response:', statusResponse)

  logInfo(ctx, 'status', {
    msg: 'status response',
    statusResponse,
  })

  const {
    headers,
    data,
    status: responseStatus,
  } = await statusClient.getStatusWithHeaders(code)

  // console.info('Status headers', headers)
  // console.info('Status data:', data)

  logInfo(ctx, 'status', {
    msg: 'status data & headers',
    statusResponse,
    headers,
    data,
  })

  ctx.status = responseStatus
  ctx.body = data
  ctx.set('Cache-Control', headers['cache-control'])

  await next()
}
